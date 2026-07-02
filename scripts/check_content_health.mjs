import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = 'src/content/blog';
const publicBlogDir = 'public/images/blog';

const offTopicTerms = [
  '护肤',
  '防晒',
  '自拍',
  '相亲',
  '发型',
  '小哥哥',
  '黄毛',
  '晒黑',
  '普通男人',
  '脸和身材',
  '变帅',
  'sunscreen',
  'skincare',
  'blind-date',
  'haircut',
  'photo-date',
  'puppy-boy',
  'villain',
];

const sensitiveTerms = [
  '臻格',
  'Zencore',
  '陈建新',
  '173654',
  'yangdanning',
  '杨丹宁',
  '身份证',
  'SD_API_KEY',
  '真实客户',
  '持仓明细',
  '真实工作材料',
  '客户案例',
  '差旅报销.zip',
  'Michael-Youngs-Macbook',
  'Mac-miniNas',
  'Super_Knowledge_Base',
  '建设银行',
  '交易单号',
  '商户单号',
  'wechat-laoming2',
  '"account": "soplaoming"',
  'ssh 老明@',
  'Tailscale IP',
  'Deploy Key',
  '某朋友的微信号',
  '老明的微信号',
  '微信号、手机号',
  '2000 元/次',
  '500 元装一次机',
  '上海、苏州可上门',
  '每周最多只接一单',
];

const brandRiskTerms = [
  '傻逼',
  'cxxxx',
  '我 tm',
  '呆逼',
  '巨叼',
  '屎一样',
  '推荐码',
  '邀请码',
  '拼好模',
  'code=',
  '2.88 元',
  '闲鱼',
  '纯扯淡',
  '太扯淡',
  '滑天下之大稽',
  '吊打',
  '胡说八道',
  '看起来没有那么不堪',
  '一条暴论',
  '小 baby',
  '2000 块钱',
  '代抢',
  '朋友圈截图',
  'Leon 的一个朋友圈',
];

const aiTerms = [
  'AI',
  'RAG',
  'Codex',
  'Claude',
  'OpenClaw',
  'Skill',
  'SOP',
  '自动化',
  '知识库',
  '工作流',
  '写作',
  '工具',
  '模型',
  'Agent',
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function walk(dir, predicate = () => true) {
  const abs = absolute(dir);
  if (!fs.existsSync(abs)) return [];

  const files = [];
  for (const name of fs.readdirSync(abs)) {
    const filePath = path.join(abs, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...walk(path.relative(root, filePath), predicate));
    } else {
      const relative = path.relative(root, filePath);
      if (predicate(relative)) files.push(relative);
    }
  }
  return files.sort();
}

function parseValue(raw) {
  const value = raw.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => parseValue(item))
      .filter(Boolean);
  }
  return value;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end === -1) return {};
  const yaml = text.slice(4, end);
  const data = {};
  for (const line of yaml.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = parseValue(match[2]);
  }
  return data;
}

function imageRefs(text) {
  return [...text.matchAll(/\/images\/blog\/[^\s)'"><]+/g)].map((match) => `public${match[0]}`);
}

function matchTerms(file, text, terms) {
  const matches = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const term of terms) {
      if (line.includes(term)) matches.push({ file, line: index + 1, term });
    }
  });
  return matches;
}

function hasAiSignal(post) {
  const haystack = [
    post.data.title,
    post.data.description,
    ...(Array.isArray(post.data.keywords) ? post.data.keywords : []),
    post.body.slice(0, 1000),
  ]
    .join(' ')
    .toLowerCase();
  return aiTerms.some((term) => haystack.includes(term.toLowerCase()));
}

const blogFiles = walk(blogDir, (file) => /\.(md|mdx)$/.test(file));
const blogImages = walk(publicBlogDir);
const imageRefSet = new Set();

const posts = blogFiles.map((file) => {
  const text = read(file);
  const data = parseFrontmatter(text);
  const body = text.replace(/^---[\s\S]*?\n---\n?/, '');
  const refs = imageRefs(text);
  refs.forEach((ref) => imageRefSet.add(ref));
  return { file, slug: path.basename(file).replace(/\.(md|mdx)$/, ''), text, body, data, refs };
});

const missingFrontmatter = [];
const invalidDates = [];
const missingHeroImages = [];
const missingReferencedImages = [];
const postsWithoutAiSignal = [];
const weakDescriptions = [];
const missingKeywords = [];
const noOriginalSource = [];
const offTopicMatches = [];
const sensitiveMatches = [];
const brandRiskMatches = [];

for (const post of posts) {
  for (const key of ['title', 'description', 'pubDate']) {
    if (!post.data[key]) missingFrontmatter.push(`${post.file}:${key}`);
  }

  const date = new Date(post.data.pubDate);
  if (!post.data.pubDate || Number.isNaN(date.getTime())) invalidDates.push(post.file);

  if (post.data.heroImage) {
    const heroFile = post.data.heroImage.startsWith('/') ? `public${post.data.heroImage}` : post.data.heroImage;
    if (!fs.existsSync(absolute(heroFile))) missingHeroImages.push(`${post.file} -> ${heroFile}`);
  }

  for (const ref of post.refs) {
    if (!fs.existsSync(absolute(ref))) missingReferencedImages.push(`${post.file} -> ${ref}`);
  }

  if (!hasAiSignal(post)) postsWithoutAiSignal.push(post.file);
  if (!post.data.description || String(post.data.description).length < 40) weakDescriptions.push(post.file);
  if (!Array.isArray(post.data.keywords) || post.data.keywords.length === 0) missingKeywords.push(post.file);
  const sourceMarkers = ['原文首发', 'GitHub', '开源', '站内原创整理', '公开技术笔记'];
  if (!sourceMarkers.some((marker) => post.text.includes(marker))) noOriginalSource.push(post.file);

  offTopicMatches.push(...matchTerms(post.file, post.text, offTopicTerms));
  sensitiveMatches.push(...matchTerms(post.file, post.text, sensitiveTerms));
  brandRiskMatches.push(...matchTerms(post.file, post.text, brandRiskTerms));
}

const latestPosts = [...posts]
  .filter((post) => !Number.isNaN(new Date(post.data.pubDate).getTime()))
  .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime())
  .slice(0, 8)
  .map((post) => ({
    slug: post.slug,
    title: post.data.title,
    pubDate: post.data.pubDate,
  }));

const unusedImages = blogImages.filter((file) => !imageRefSet.has(file));
const daysSinceLatest = latestPosts.length
  ? Math.floor((Date.now() - new Date(latestPosts[0].pubDate).getTime()) / 86400000)
  : null;

const hardProblems = [
  ...missingFrontmatter.map((item) => `missing frontmatter: ${item}`),
  ...invalidDates.map((item) => `invalid pubDate: ${item}`),
  ...missingHeroImages.map((item) => `missing hero image: ${item}`),
  ...missingReferencedImages.map((item) => `missing referenced image: ${item}`),
  ...offTopicMatches.map((match) => `off-topic term ${match.term}: ${match.file}:${match.line}`),
  ...sensitiveMatches.map((match) => `sensitive term ${match.term}: ${match.file}:${match.line}`),
  ...brandRiskMatches.map((match) => `brand-risk term ${match.term}: ${match.file}:${match.line}`),
];

const softWarnings = [
  ...postsWithoutAiSignal.map((file) => `weak AI topic signal: ${file}`),
  ...weakDescriptions.map((file) => `short or missing description: ${file}`),
  ...missingKeywords.map((file) => `missing keywords: ${file}`),
  ...noOriginalSource.map((file) => `no obvious original/source marker: ${file}`),
];

if (daysSinceLatest !== null && daysSinceLatest > 45) {
  softWarnings.push(`latest post is ${daysSinceLatest} days old`);
}

console.log(JSON.stringify({
  ok: hardProblems.length === 0,
  counts: {
    posts: posts.length,
    blogImages: blogImages.length,
    referencedImages: imageRefSet.size,
    unusedImages: unusedImages.length,
    hardProblems: hardProblems.length,
    softWarnings: softWarnings.length,
  },
  latestPosts,
  daysSinceLatest,
  hardProblems,
  softWarnings,
  unusedImages,
}, null, 2));

if (hardProblems.length > 0) process.exit(1);
