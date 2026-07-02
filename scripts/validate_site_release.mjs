import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const warnings = [];

const sourceExtensions = new Set(['.astro', '.js', '.md', '.mjs', '.ts']);
const scanExtensions = new Set(['.astro', '.html', '.js', '.json', '.md', '.ts', '.txt', '.xml']);
const commercialPages = ['index', 'start', 'services', 'ai-acquisition', 'skills', 'skill-sop', 'projects', 'memory-os', 'diagnosis', 'workflow-diagnosis', 'brief', 'roi-calculator', 'pricing', 'delivery', 'trust', 'shanghai-ai', 'coffee-chat', 'workshop', 'products', 'cases', 'about'];
const requiredRoutes = ['/', '/start/', '/services/', '/ai-acquisition/', '/skills/', '/skill-sop/', '/projects/', '/memory-os/', '/diagnosis/', '/workflow-diagnosis/', '/brief/', '/roi-calculator/', '/pricing/', '/delivery/', '/trust/', '/shanghai-ai/', '/coffee-chat/', '/workshop/', '/products/', '/cases/', '/blog/'];
const removedSlugPatterns = [
  'admit-poor',
  'ai-era-male-survival',
  'girls-line-up',
  'haircut',
  'hairstyle',
  'how-much-i-earned',
  'mac-wechat-dual',
  'mom-asked',
  'photo-date',
  'puppy-boy',
  'shanghai-little-brother',
  'shaved',
  'suitable-to-play',
  'sunscreen',
  'tired-face',
  'waste-five',
  'wechat-ledger',
  'yellow-haired',
  'korean-oppa',
];
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
  'wechat-ledger',
  'mom-asked',
  'girls-line-up',
  'shanghai-little-brother',
  'ai-era-male-survival',
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
const ignoredRuntimeFiles = ['.astro/data-store.json', '.astro/settings.json'];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(dir, predicate = () => true) {
  const abs = path.join(root, dir);
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

function collectImageRefs(files) {
  const refs = new Set();
  for (const file of files) {
    const text = read(file);
    for (const match of text.matchAll(/\/images\/blog\/[^\s)'"><]+/g)) {
      refs.add(`public${match[0]}`);
    }
  }
  return refs;
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

function matchLines(files, terms) {
  const results = [];
  for (const file of files) {
    const text = read(file);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const term of terms) {
        if (line.includes(term)) {
          results.push({ file, line: index + 1, term, text: line.trim() });
        }
      }
    });
  }
  return results;
}

function pagePath(page) {
  return page === 'index' ? 'dist/index.html' : `dist/${page}/index.html`;
}

function gitStatus(paths) {
  try {
    return execFileSync('git', ['status', '--short', '--', ...paths], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function routeForDistHtml(file) {
  const relative = file.replace(/^dist\/?/, '');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
  return `/${relative.replace(/\.html$/, '')}`;
}

function internalUrlFromHref(href, sourceFile) {
  const raw = href.trim();
  if (
    !raw ||
    raw.startsWith('#') ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:') ||
    raw.startsWith('sms:') ||
    raw.startsWith('javascript:') ||
    raw.startsWith('data:') ||
    raw.startsWith('//')
  ) {
    return null;
  }

  try {
    const base = new URL(routeForDistHtml(sourceFile), 'https://ailaoming.com');
    const url = new URL(raw, base);
    if (!['ailaoming.com', 'www.ailaoming.com'].includes(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function candidatesForDistPath(pathname) {
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    decodedPathname = pathname;
  }

  const clean = decodedPathname.replace(/^\/+/, '');
  if (decodedPathname === '/') return ['dist/index.html'];

  if (decodedPathname.endsWith('/')) {
    return [`dist/${clean}index.html`];
  }

  if (path.extname(decodedPathname)) {
    return [`dist/${clean}`];
  }

  return [`dist/${clean}/index.html`, `dist/${clean}.html`];
}

function resolveDistPath(pathname) {
  return candidatesForDistPath(pathname).find((candidate) => exists(candidate)) ?? null;
}

const anchorCache = new Map();
function anchorsForHtml(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const anchors = new Set();
  const html = read(file);
  for (const match of html.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)) {
    anchors.add(match[1]);
  }
  anchorCache.set(file, anchors);
  return anchors;
}

const sourceFiles = walk('src', (file) => sourceExtensions.has(path.extname(file)));
const scanFiles = [
  ...walk('src', (file) => scanExtensions.has(path.extname(file))),
  ...walk('public', (file) => scanExtensions.has(path.extname(file))),
  ...walk('dist', (file) => scanExtensions.has(path.extname(file))),
];
const distHtmlFiles = walk('dist', (file) => path.extname(file) === '.html');

check(exists('dist/index.html'), 'dist/index.html is missing. Run npm run build first.');
check(exists('dist/sitemap-index.xml'), 'dist/sitemap-index.xml is missing. Run npm run build first.');
check(exists('dist/rss.xml'), 'dist/rss.xml is missing. Run npm run build first.');
check(exists('dist/robots.txt'), 'dist/robots.txt is missing.');

const blogFiles = walk('src/content/blog', (file) => path.extname(file) === '.md');
const distBlogDirs = fs.existsSync(path.join(root, 'dist/blog'))
  ? fs.readdirSync(path.join(root, 'dist/blog'), { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];
check(blogFiles.length === distBlogDirs.length, `blog source count (${blogFiles.length}) does not match dist/blog page count (${distBlogDirs.length}).`);

const imageRefs = collectImageRefs(sourceFiles);
const blogImages = walk('public/images/blog');
const missingImages = [...imageRefs].filter((file) => !exists(file));
const unusedImages = blogImages.filter((file) => !imageRefs.has(file));
check(missingImages.length === 0, `missing referenced blog images: ${missingImages.join(', ')}`);
check(unusedImages.length === 0, `unused public blog images: ${unusedImages.join(', ')}`);

let redactedImageCount = 0;
if (exists('scripts/redacted_image_manifest.json')) {
  const manifest = JSON.parse(read('scripts/redacted_image_manifest.json'));
  const items = Array.isArray(manifest.items) ? manifest.items : [];
  redactedImageCount = items.length;
  const paths = new Set();
  check(items.length >= 33, `redacted image manifest is unexpectedly small: ${items.length}`);
  for (const item of items) {
    check(item.path && item.sha256 && item.reason, `redacted image manifest item is incomplete: ${JSON.stringify(item)}`);
    if (!item.path) continue;
    check(!paths.has(item.path), `redacted image manifest has duplicate path: ${item.path}`);
    paths.add(item.path);
    check(exists(item.path), `redacted image is missing: ${item.path}`);
    check(imageRefs.has(item.path), `redacted image is not referenced by source content: ${item.path}`);
    if (exists(item.path) && item.sha256) {
      const actual = sha256(item.path);
      check(actual === item.sha256, `redacted image hash changed and needs manual privacy review: ${item.path}`);
    }
  }
} else {
  errors.push('scripts/redacted_image_manifest.json is missing.');
}

const missingBlogLinks = [];
for (const file of sourceFiles) {
  const text = read(file);
  for (const match of text.matchAll(/\/blog\/([a-z0-9-]+)\//g)) {
    const slug = match[1];
    if (!exists(`src/content/blog/${slug}.md`)) {
      missingBlogLinks.push(`${file} -> /blog/${slug}/`);
    }
  }
}
check(missingBlogLinks.length === 0, `missing linked blog posts: ${missingBlogLinks.join(', ')}`);

const missingInternalLinks = [];
const missingInternalAnchors = [];
let internalLinksChecked = 0;
for (const file of distHtmlFiles) {
  const html = read(file);
  for (const match of html.matchAll(/\shref=["']([^"']+)["']/g)) {
    const href = match[1];
    const url = internalUrlFromHref(href, file);
    if (!url) continue;

    internalLinksChecked += 1;
    const target = resolveDistPath(url.pathname);
    if (!target) {
      missingInternalLinks.push(`${file} -> ${href}`);
      continue;
    }

    if (url.hash && path.extname(target) === '.html') {
      let anchor = url.hash.slice(1);
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        // Keep the raw hash if decoding fails; the check below will still catch the mismatch.
      }
      if (anchor && !anchorsForHtml(target).has(anchor)) {
        missingInternalAnchors.push(`${file} -> ${href}`);
      }
    }
  }
}
check(missingInternalLinks.length === 0, `missing internal links: ${missingInternalLinks.join(', ')}`);
check(missingInternalAnchors.length === 0, `missing internal anchors: ${missingInternalAnchors.join(', ')}`);

const offTopicMatches = matchLines(scanFiles, offTopicTerms);
check(offTopicMatches.length === 0, `off-topic terms remain: ${offTopicMatches.map((m) => `${m.file}:${m.line}:${m.term}`).join(', ')}`);

const brandRiskMatches = matchLines(scanFiles, brandRiskTerms).filter((match) => (
  !match.file.includes('scripts/check_content_health.mjs') &&
  !match.file.includes('scripts/validate_site_release.mjs')
));
check(brandRiskMatches.length === 0, `brand-risk terms remain: ${brandRiskMatches.map((m) => `${m.file}:${m.line}:${m.term}`).join(', ')}`);

const sensitiveMatches = matchLines(scanFiles, sensitiveTerms).filter((match) => {
  const allowedBoundary = match.file.includes('projects') && (match.text.includes('不公开') || match.text.includes('不会进入网站'));
  return !allowedBoundary;
});
check(sensitiveMatches.length === 0, `sensitive terms remain outside explicit boundary copy: ${sensitiveMatches.map((m) => `${m.file}:${m.line}:${m.term}`).join(', ')}`);

for (const page of commercialPages) {
  const file = pagePath(page);
  check(exists(file), `${file} is missing.`);
  if (exists(file)) {
    const html = read(file);
    check(html.includes('soplaoming'), `${file} is missing WeChat conversion text.`);
    check(!html.includes('busuanzi') && !html.includes('ibruce'), `${file} should not load article engagement scripts.`);
    check((html.match(/<h1/g) || []).length === 1, `${file} should have exactly one h1.`);
    check(!html.includes('<form'), `${file} should not collect visitor data with a form.`);
    check(html.includes('name="theme-color" content="#0066ff"'), `${file} is missing theme-color.`);
    check(html.includes('name="color-scheme" content="light"'), `${file} is missing color-scheme.`);
  }
}

for (const file of ['dist/index.html', 'dist/start/index.html', 'dist/services/index.html', 'dist/ai-acquisition/index.html', 'dist/diagnosis/index.html', 'dist/workflow-diagnosis/index.html', 'dist/skill-sop/index.html', 'dist/brief/index.html', 'dist/roi-calculator/index.html', 'dist/pricing/index.html', 'dist/delivery/index.html', 'dist/trust/index.html', 'dist/shanghai-ai/index.html', 'dist/coffee-chat/index.html', 'dist/workshop/index.html', 'dist/cases/index.html', 'dist/memory-os/index.html', 'dist/blog/codex-pro-200-dollar-how-i-use-it/index.html']) {
  if (!exists(file)) continue;
  const html = read(file);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(scripts.length > 0, `${file} is missing JSON-LD.`);
  for (const script of scripts) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      errors.push(`${file} has invalid JSON-LD: ${error.message}`);
    }
  }
}

for (const file of ['dist/start/index.html', 'dist/services/index.html', 'dist/ai-acquisition/index.html', 'dist/workflow-diagnosis/index.html', 'dist/skill-sop/index.html', 'dist/roi-calculator/index.html', 'dist/pricing/index.html', 'dist/delivery/index.html', 'dist/trust/index.html', 'dist/shanghai-ai/index.html', 'dist/coffee-chat/index.html', 'dist/workshop/index.html', 'dist/memory-os/index.html']) {
  if (!exists(file)) continue;
  const html = read(file);
  check(html.includes('"@type":"FAQPage"'), `${file} is missing FAQPage JSON-LD.`);
  check(html.includes('<details'), `${file} is missing visible FAQ details.`);
}

for (const file of [
  'dist/index.html',
  'dist/start/index.html',
  'dist/services/index.html',
  'dist/cases/index.html',
  'dist/ai-acquisition/index.html',
  'dist/skills/index.html',
  'dist/skill-sop/index.html',
  'dist/diagnosis/index.html',
  'dist/workflow-diagnosis/index.html',
  'dist/brief/index.html',
  'dist/roi-calculator/index.html',
  'dist/pricing/index.html',
  'dist/delivery/index.html',
  'dist/trust/index.html',
  'dist/shanghai-ai/index.html',
  'dist/workshop/index.html',
  'dist/memory-os/index.html',
  'dist/products/index.html',
  'dist/coffee-chat/index.html',
  'dist/blog/codex-pro-200-dollar-how-i-use-it/index.html',
]) {
  if (!exists(file)) continue;
  const html = read(file);
  check(html.includes('复制咨询模板'), `${file} is missing copyable consultation template CTA.`);
  check(html.includes('复制微信号'), `${file} is missing copyable WeChat ID CTA.`);
  check(html.includes('data-copy='), `${file} is missing CTA clipboard data.`);
  for (const term of ['来源：ailaoming.com', '预算意向：', '期望启动时间：', '是否接受先诊断再项目：', '隐私边界：']) {
    check(html.includes(term), `${file} is missing qualified consultation copy term: ${term}`);
  }
}

if (exists('dist/start/index.html')) {
  const html = read('dist/start/index.html');
  for (const term of [
    'AI 首步分流',
    'Start Here',
    '第一次来，先点这里',
    '复制首步判断卡',
    '来源：ailaoming.com/start',
    '线索类型：AI 首步分流',
    '不提交表单',
    '不上传、不存储',
    '先自学 / 资料卡',
    '先做 AI 自测',
    'ROI 估算',
    '估算值不值',
    '复制需求卡',
    '看诊断服务',
    '看获客诊断',
    '看合作方式',
    '看交付流程',
    '上海 Coffee Chat',
    '上海 AI 小型工作坊',
    '看工作坊预审',
    '看服务方案',
    'AI 获客站诊断',
    '先低成本判断',
    '先脱敏样例',
    '先验收口径',
    '先匹配预算',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
  ]) {
    check(html.includes(term), `start page is missing first-step-router term: ${term}`);
  }
  const routeCards = html.match(/class="route-card"/g)?.length ?? 0;
  check(routeCards >= 6, `start page should expose at least 6 route cards, got ${routeCards}.`);
  check(html.includes('"@type":"WebPage"'), 'start page is missing WebPage JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'start page is missing FAQPage JSON-LD.');
  for (const route of ['/products', '/diagnosis', '/roi-calculator', '/workflow-diagnosis', '/skill-sop', '/brief', '/ai-acquisition', '/pricing', '/delivery', '/coffee-chat', '/workshop', '/services', '/cases']) {
    check(html.includes(route), `start page is missing route: ${route}`);
  }
  check(html.includes('navigator.clipboard'), 'start page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'start page is missing clipboard data.');
  check(!html.includes('<form'), 'start page should not collect visitor data.');
}

if (exists('dist/ai-acquisition/index.html')) {
  const html = read('dist/ai-acquisition/index.html');
  for (const term of [
    'AI 获客站诊断',
    'AI Acquisition Funnel',
    '复制获客站诊断卡',
    '来源：ailaoming.com/ai-acquisition',
    '线索类型：AI 获客站诊断 / 内容转线索',
    '内容入口',
    '证据资产',
    '自助判断',
    '低摩擦联系',
    '交流承接',
    '服务交付',
    '定位是否一句话说清',
    '内容是否能导向下一步',
    '证据是否能公开核验',
    '线索是否足够合格',
    '本地活动是否有承接',
    '发布是否可控',
    'AI 获客站诊断复盘台账',
    'Review Ledger',
    '这里先记录本站自己的公开自诊断，不虚构合作案例',
    'ailaoming.com 本站自诊断',
    'Skill 资产公开化复盘',
    '上海 Coffee Chat 承接路径',
    '模板上线，等待真实复盘',
    '公开样例运行中',
    '已验证信号',
    '不公开访客资料、私域聊天、未确认报价、后台数据、未授权原始材料和内部运营细节',
    '不承诺收益',
    '不收表单',
    '不上传访客资料',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    'Coffee Chat',
    '工作坊',
    '本地发布清单',
    '不提交表单',
    '不上传、不存储',
    '/cases',
    '/diagnosis',
    '/products#resource-content-loop',
    '/coffee-chat',
    '/workshop',
    '/brief',
    '/services',
  ]) {
    check(html.includes(term), `AI acquisition page is missing funnel term: ${term}`);
  }
  const acquisitionCards = html.match(/<article/g)?.length ?? 0;
  check(acquisitionCards >= 15, `AI acquisition page should expose at least 15 funnel, diagnostic and recap cards, got ${acquisitionCards}.`);
  check(html.includes('"@type":"Service"'), 'AI acquisition page is missing Service JSON-LD.');
  check(html.includes('"@type":"WebPage"'), 'AI acquisition page is missing WebPage JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'AI acquisition page is missing FAQPage JSON-LD.');
  check(html.includes('navigator.clipboard'), 'AI acquisition page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'AI acquisition page is missing clipboard data.');
  check(!html.includes('<form'), 'AI acquisition page should not collect visitor data.');
}

if (exists('dist/diagnosis/index.html')) {
  const html = read('dist/diagnosis/index.html');
  check(html.includes('diagnosis-check'), 'diagnosis page is missing interactive checklist controls.');
  check(html.includes('data-dimension='), 'diagnosis page is missing dimension metadata on checklist controls.');
  check(html.includes('data-dimension-score='), 'diagnosis page is missing dimension score display.');
  check(html.includes('navigator.clipboard'), 'diagnosis page is missing copy-summary behavior.');
  check(html.includes('不提交、不存储、不上传'), 'diagnosis page is missing local privacy copy.');
  for (const term of [
    '四维度成熟度',
    '路径矩阵',
    '资料基础',
    '流程清晰度',
    '交付价值',
    '风险边界',
    '知识库治理 / 权限边界',
    '四维度：',
    '自测前准备',
    '资料不够清楚时，先拿一张资料卡',
    'AI 工具 7 天实践路线',
    'Skill 首次需求模板',
    '知识库整理自查清单',
    '内容商业化闭环画布',
    '我已准备或需要补的资料卡',
    '资料卡',
    '/products',
    '先完成自测',
    '按这个结果约 Coffee Chat',
    '小型工作坊',
    '/workshop',
    '看诊断服务',
    '看 Skill/SOP 小项目',
    '先补资料和风险边界',
    '先复制资料卡',
    '建议下一步：',
  ]) {
    check(html.includes(term), `diagnosis page is missing funnel term: ${term}`);
  }
  check(html.includes('id="result-primary-action"'), 'diagnosis page is missing dynamic primary result action.');
  check(html.includes('资料基础或风险边界偏弱'), 'diagnosis page is missing boundary-first result logic.');
  check(html.includes('"@type":"WebApplication"'), 'diagnosis page is missing WebApplication JSON-LD.');
  check(html.includes('BusinessApplication'), 'diagnosis page is missing business application category.');
  check(!html.includes('<form'), 'diagnosis page should not submit visitor data.');
}

if (exists('dist/workflow-diagnosis/index.html')) {
  const html = read('dist/workflow-diagnosis/index.html');
  for (const term of [
    'AI 工作流诊断',
    'Workflow Diagnosis',
    '先把一个流程拆清楚',
    '这四个信号齐了，就适合做诊断',
    '有重复流程',
    '有脱敏样例',
    '有明确输出',
    '有验收标准',
    '5 步诊断流程',
    '需求压缩',
    '资料入口盘点',
    '人机分工判断',
    '小闭环选择',
    '路线图交付',
    '诊断结束后，你应该拿到什么',
    '一页诊断路线图',
    '工具与资料分工',
    '小项目候选清单',
    '暂缓与拒绝清单',
    '四类常见诊断范围',
    '复制诊断预审卡',
    '来源：ailaoming.com/workflow-diagnosis',
    '线索类型：AI 工作流诊断 / 预审',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    'FAQPage',
    'Service',
  ]) {
    check(html.includes(term), `workflow diagnosis page is missing service term: ${term}`);
  }
  check((html.match(/<article/g) ?? []).length >= 13, 'workflow diagnosis page should expose fit, process and deliverable cards.');
  check(html.includes('"@type":"Service"'), 'workflow diagnosis page is missing Service JSON-LD.');
  check(html.includes('"@type":"OfferCatalog"'), 'workflow diagnosis page is missing OfferCatalog JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'workflow diagnosis page is missing FAQPage JSON-LD.');
  check(html.includes('/diagnosis') && html.includes('/brief') && html.includes('/delivery') && html.includes('/pricing') && html.includes('/coffee-chat') && html.includes('/trust'), 'workflow diagnosis page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'workflow diagnosis page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'workflow diagnosis page is missing clipboard data.');
  check(!html.includes('<form'), 'workflow diagnosis page should not collect visitor data.');
}

if (exists('dist/skill-sop/index.html')) {
  const html = read('dist/skill-sop/index.html');
  for (const term of [
    'Skill/SOP 小项目',
    'Skill / SOP Project',
    '把重复任务做成可复跑资产',
    '这四个信号齐了，才适合做小项目',
    '重复频率够高',
    '输入相对稳定',
    '输出能验收',
    '人工确认点清楚',
    '四类常见 Skill/SOP 模块',
    '文档与格式保真',
    '办公材料整理',
    '内容生产流程',
    '知识库与检索 SOP',
    '5 步做成可复跑资产',
    '样例收口',
    '流程拆解',
    'Skill / SOP 固化',
    '脱敏样例试跑',
    '交付与复盘',
    '小项目交付物',
    'Skill/SOP 主文件',
    '样例与验收清单',
    '模板或脚本资产',
    '维护与升级建议',
    '验收矩阵',
    '复制 Skill/SOP 小项目预审卡',
    '来源：ailaoming.com/skill-sop',
    '线索类型：Skill/SOP 小项目 / 预审',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    'FAQPage',
    'Service',
  ]) {
    check(html.includes(term), `skill-sop page is missing service term: ${term}`);
  }
  check((html.match(/<article/g) ?? []).length >= 17, 'skill-sop page should expose fit, module, process and deliverable cards.');
  check(html.includes('"@type":"Service"'), 'skill-sop page is missing Service JSON-LD.');
  check(html.includes('"@type":"OfferCatalog"'), 'skill-sop page is missing OfferCatalog JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'skill-sop page is missing FAQPage JSON-LD.');
  check(html.includes('/workflow-diagnosis') && html.includes('/skills') && html.includes('/brief') && html.includes('/delivery') && html.includes('/coffee-chat'), 'skill-sop page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'skill-sop page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'skill-sop page is missing clipboard data.');
  check(!html.includes('<form'), 'skill-sop page should not collect visitor data.');
}

if (exists('dist/brief/index.html')) {
  const html = read('dist/brief/index.html');
  for (const term of [
    'AI 咨询需求卡',
    'Consultation Brief',
    'AI 工作流诊断需求卡',
    'AI 获客站诊断需求卡',
    'Skill / SOP 小项目需求卡',
    '个人知识库整理需求卡',
    '上海 AI Coffee Chat 预约卡',
    '上海 AI 小型工作坊预审卡',
    '看获客站诊断',
    '当前内容资产：公众号 / 小红书 / 个人网站 / 项目看板 / 资料包 / 其他：',
    '备注：上海 AI 工作坊预审',
    '工作坊主题：AI 工作流 / 知识库-RAG / Skill-SOP / 内容商业化 / 其他：',
    '来源：ailaoming.com/brief',
    '是否接受先诊断再项目：',
    '预算意向：',
    '期望启动时间：',
    '隐私边界：',
    '不提交表单',
    '不上传、不存储',
    '复制这张需求卡',
    '伪造、绕规、骚扰和替代专业责任',
  ]) {
    check(html.includes(term), `brief page is missing consultation-brief term: ${term}`);
  }
  const briefCardCount = (html.match(/class="consultation-brief-card"/g) ?? []).length;
  const copyButtonCount = (html.match(/class="copy-brief-card"/g) ?? []).length;
  check(briefCardCount >= 6, `brief page should expose at least 6 consultation brief cards, got ${briefCardCount}.`);
  check(copyButtonCount >= 6, `brief page should expose at least 6 copy buttons, got ${copyButtonCount}.`);
  check(html.includes('"@type":"WebPage"'), 'brief page is missing WebPage JSON-LD.');
  check(html.includes('/diagnosis') && html.includes('/services') && html.includes('/ai-acquisition') && html.includes('/coffee-chat') && html.includes('/workshop'), 'brief page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'brief page is missing clipboard copy behavior.');
  check(!html.includes('<form'), 'brief page should not collect visitor data.');
}

if (exists('dist/roi-calculator/index.html')) {
  const html = read('dist/roi-calculator/index.html');
  for (const term of [
    'AI ROI 估算器',
    'AI ROI Calculator',
    '先算清一个流程值不值得做 AI',
    '本地计算，不提交、不存储、不上传',
    '每周耗时',
    '机会成本口径',
    '返工比例',
    '预计 AI 可节省比例',
    '月度节省时间',
    '月度释放价值',
    '年度释放价值',
    '流程复杂度',
    '单一文档',
    '多步骤流程',
    '多工具系统',
    '复制 ROI 咨询摘要',
    '手动复制摘要',
    'roi-copy-preview',
    '来源：ailaoming.com/roi-calculator',
    '线索类型：AI ROI 估算 / 预算判断',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    '资料卡 / AI 自测',
    'Coffee Chat / 轻量预诊断',
    'AI 工作流诊断',
    'Skill/SOP 小项目',
  ]) {
    check(html.includes(term), `roi calculator page is missing ROI qualification term: ${term}`);
  }
  const rangeControls = html.match(/type="range"/g)?.length ?? 0;
  check(rangeControls >= 4, `roi calculator should expose at least 4 range controls, got ${rangeControls}.`);
  check(html.includes('data-complexity="simple"') && html.includes('data-complexity="workflow"') && html.includes('data-complexity="system"'), 'roi calculator is missing complexity segmented controls.');
  check(html.includes('"@type":"WebApplication"'), 'roi calculator page is missing WebApplication JSON-LD.');
  check(html.includes('BusinessApplication'), 'roi calculator page is missing business application category.');
  check(html.includes('"@type":"FAQPage"'), 'roi calculator page is missing FAQPage JSON-LD.');
  check(html.includes('/pricing') && html.includes('/brief') && html.includes('/workflow-diagnosis') && html.includes('/skill-sop') && html.includes('/coffee-chat') && html.includes('/diagnosis'), 'roi calculator page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'roi calculator page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'roi calculator page is missing clipboard data.');
  check(!html.includes('<form'), 'roi calculator page should not collect visitor data.');
}

if (exists('dist/shanghai-ai/index.html')) {
  const html = read('dist/shanghai-ai/index.html');
  for (const term of [
    '上海 AI 工作流诊断与 Coffee Chat',
    'Shanghai AI Service',
    '上海本地 AI 咨询 / Coffee Chat',
    '来源：ailaoming.com/shanghai-ai',
    '复制上海本地需求卡',
    'AI 工作流诊断',
    '个人知识库整理',
    '办公 Skill / SOP 小项目',
    '内容商业化与获客站',
    '上海 AI 小型工作坊',
    '看小型工作坊',
    '/workshop',
    '线下只约交通方便的公开场所',
    '不写具体私人地址',
    '不承诺上门服务',
    '线上预沟通',
    '是否接受先诊断再项目：',
    '预算意向：',
    '期望启动时间：',
    '隐私边界：',
    '不需要提交表单',
  ]) {
    check(html.includes(term), `shanghai local page is missing local-service term: ${term}`);
  }
  check(html.includes('"@type":"Service"'), 'shanghai local page is missing Service JSON-LD.');
  check(html.includes('areaServed') && html.includes('上海'), 'shanghai local page is missing Shanghai areaServed JSON-LD.');
  check(html.includes('FAQPage'), 'shanghai local page is missing FAQPage JSON-LD.');
  check(html.includes('/brief') && html.includes('/coffee-chat') && html.includes('/workshop') && html.includes('/services') && html.includes('/diagnosis'), 'shanghai local page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'shanghai local page is missing clipboard copy behavior.');
  check(!html.includes('<form'), 'shanghai local page should not collect visitor data.');
}

if (exists('dist/workshop/index.html')) {
  const html = read('dist/workshop/index.html');
  for (const term of [
    '上海 AI 小型工作坊',
    'Shanghai AI Workshop',
    '复制工作坊预审卡',
    '来源：ailaoming.com/workshop',
    '线索类型：上海 AI 小型工作坊 / 小团队内训预审',
    '3-8 人',
    '会前预审',
    '边界确认',
    '流程拆解',
    '现场试跑',
    '输出清单',
    '会后沉淀',
    'AI 工作流实战工作坊',
    '知识库与 RAG 工作坊',
    '办公 Skill/SOP 工作坊',
    '内容商业化工作坊',
    '不公开具体地点',
    '不虚构已举办场次',
    '小团队内训预审',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    '不提交表单',
    '不上传、不存储',
    '先做 AI 自测',
    '先看 Coffee Chat',
    '上海本地入口',
    '/diagnosis',
    '/coffee-chat',
    '/shanghai-ai',
    '/brief',
  ]) {
    check(html.includes(term), `workshop page is missing workshop qualification term: ${term}`);
  }
  const workshopArticles = html.match(/<article/g)?.length ?? 0;
  check(workshopArticles >= 13, `workshop page should expose at least 13 workshop cards, got ${workshopArticles}.`);
  check(html.includes('"@type":"Service"'), 'workshop page is missing Service JSON-LD.');
  check(html.includes('"@type":"WebPage"'), 'workshop page is missing WebPage JSON-LD.');
  check(html.includes('areaServed') && html.includes('上海'), 'workshop page is missing Shanghai areaServed JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'workshop page is missing FAQPage JSON-LD.');
  check(html.includes('navigator.clipboard'), 'workshop page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'workshop page is missing clipboard data.');
  check(!html.includes('<form'), 'workshop page should not collect visitor data.');
}

if (exists('dist/pricing/index.html')) {
  const html = read('dist/pricing/index.html');
  for (const term of [
    'AI 合作方式与预算口径',
    'Pricing Logic',
    '公开页面不写死价格',
    '真实报价只在需求、样例和验收边界清楚后确认',
    'Coffee Chat / 预诊断',
    'AI 小型工作坊',
    'AI 获客站诊断',
    'AI 工作流诊断',
    'Skill / SOP 小项目',
    'AI 系统阶段陪跑',
    '预算口径',
    '启动条件',
    '首次材料',
    '本次交付',
    '升级条件',
    '暂缓信号',
    '真实报价取决于哪些因素',
    '复制合作判断卡',
    '先估算 ROI',
    '看工作坊预审',
    '看获客诊断',
    'AI ROI 估算器',
    '看交付流程',
    '/roi-calculator',
    '/workshop',
    '/ai-acquisition',
    '/delivery',
    '来源：ailaoming.com/pricing',
    '线索类型：AI 合作方式 / 预算口径',
    '是否接受先诊断再项目：',
    '期望启动时间：',
    '隐私边界：',
    '不需要提交表单',
  ]) {
    check(html.includes(term), `pricing page is missing cooperation-pricing term: ${term}`);
  }
  const modelCards = (html.match(/class="model-label"/g) ?? []).length;
  check(modelCards >= 5, `pricing page should expose at least 5 engagement models, got ${modelCards}.`);
  check(html.includes('"@type":"OfferCatalog"'), 'pricing page is missing OfferCatalog JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'pricing page is missing FAQPage JSON-LD.');
  check(html.includes('/brief') && html.includes('/services') && html.includes('/ai-acquisition') && html.includes('/coffee-chat') && html.includes('/workshop') && html.includes('/projects') && html.includes('/delivery') && html.includes('/roi-calculator'), 'pricing page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'pricing page is missing clipboard copy behavior.');
  check(!html.includes('<form'), 'pricing page should not collect visitor data.');
}

if (exists('dist/delivery/index.html')) {
  const html = read('dist/delivery/index.html');
  for (const term of [
    'AI 项目交付流程',
    'Delivery Playbook',
    '从需求卡到可复跑闭环',
    '6 步交付流程',
    '需求卡收口',
    '诊断与范围锁定',
    '脱敏样例试跑',
    'SOP / Skill 固化',
    '本地验证与交付',
    '复盘与迭代判断',
    '四类交付物',
    '诊断路线图',
    'Skill / SOP 小项目',
    '知识库治理包',
    '系统阶段陪跑',
    '交付前先看验收矩阵',
    '这些情况先暂停，不硬做项目',
    '项目启动前材料清单',
    '复制启动预审卡',
    '来源：ailaoming.com/delivery',
    '线索类型：AI 项目交付流程 / 启动预审',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
  ]) {
    check(html.includes(term), `delivery page is missing delivery-playbook term: ${term}`);
  }
  check((html.match(/<article/g) ?? []).length >= 10, 'delivery page should expose process and deliverable cards.');
  check(html.includes('"@type":"HowTo"'), 'delivery page is missing HowTo JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'delivery page is missing FAQPage JSON-LD.');
  check(html.includes('/brief') && html.includes('/diagnosis') && html.includes('/pricing') && html.includes('/coffee-chat'), 'delivery page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'delivery page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'delivery page is missing clipboard data.');
  check(!html.includes('<form'), 'delivery page should not collect visitor data.');
}

if (exists('dist/trust/index.html')) {
  const html = read('dist/trust/index.html');
  for (const term of [
    'AI 咨询信任与隐私边界',
    'Trust Center',
    '第一次只发脱敏材料',
    '可以先发什么',
    '不要直接发送什么',
    '我如何处理材料',
    '不提交表单',
    '不上传、不存储',
    '公开展示边界',
    '脱敏材料准备卡',
    '复制隐私边界卡',
    '来源：ailaoming.com/trust',
    '线索类型：AI 咨询隐私边界 / 脱敏材料准备',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
    '高风险需求不接',
    '公开前二次脱敏',
    'FAQPage',
    'WebPage',
  ]) {
    check(html.includes(term), `trust page is missing trust-center term: ${term}`);
  }
  check((html.match(/<article/g) ?? []).length >= 16, 'trust page should expose safe-input, blocked-input and handling-rule cards.');
  check(html.includes('"@type":"FAQPage"'), 'trust page is missing FAQPage JSON-LD.');
  check(html.includes('"@type":"WebPage"'), 'trust page is missing WebPage JSON-LD.');
  check(html.includes('/brief') && html.includes('/delivery') && html.includes('/diagnosis') && html.includes('/skill-sop') && html.includes('/coffee-chat'), 'trust page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'trust page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'trust page is missing clipboard data.');
  check(!html.includes('<form'), 'trust page should not collect visitor data.');
}

if (exists('dist/memory-os/index.html')) {
  const html = read('dist/memory-os/index.html');
  for (const term of [
    'AI 长期记忆库 OS',
    'Memory OS',
    '把上下文做成可维护资产',
    '不是一坨资料，而是分层记忆系统',
    '准入规则',
    '排除规则',
    '状态规则',
    '隐私规则',
    'Evaluation',
    'v1.0',
    '1.000',
    '0.990',
    '3.10',
    '记忆架构诊断',
    'Git 版上下文仓库',
    '隐私与身份防火墙',
    '评测与治理脚本',
    '不展示真实记忆条目',
    '不展示真实记忆条目、私有仓库、本地路径',
    '先判断你的记忆系统该怎么搭',
    '来源：ailaoming.com',
    '预算意向：',
    '期望启动时间：',
    '是否接受先诊断再项目：',
    '隐私边界：',
  ]) {
    check(html.includes(term), `memory-os page is missing public memory system term: ${term}`);
  }
  const architectureCards = html.match(/class="architecture-grid"/g)?.length ?? 0;
  check(architectureCards >= 1, 'memory-os page is missing architecture grid.');
  check(['v0.1', 'v0.3', 'v0.4', 'v1.0'].every((version) => html.includes(version)), 'memory-os page should expose at least 4 evaluation rows.');
  check(html.includes('"@type":"Service"'), 'memory-os page is missing Service JSON-LD.');
  check(html.includes('"@type":"FAQPage"'), 'memory-os page is missing FAQPage JSON-LD.');
  check(html.includes('/diagnosis') && html.includes('/coffee-chat') && html.includes('/brief') && html.includes('/services#knowledge-base'), 'memory-os page is missing key conversion routes.');
  check(html.includes('navigator.clipboard'), 'memory-os page is missing clipboard copy behavior.');
  check(html.includes('data-copy='), 'memory-os page is missing clipboard data.');
  check(!html.includes('<form'), 'memory-os page should not collect visitor data.');
}

for (const file of [
  'dist/index.html',
  'dist/services/index.html',
  'dist/diagnosis/index.html',
  'dist/cases/index.html',
  'dist/coffee-chat/index.html',
]) {
  if (!exists(file)) continue;
  const html = read(file);
  for (const term of ['信任边界', '脱敏样例', '验收口径']) {
    check(html.includes(term), `${file} is missing trust-boundary term: ${term}`);
  }
}

if (exists('dist/blog/index.html')) {
  const html = read('dist/blog/index.html');
	for (const term of [
	  '按场景阅读',
	  '先看 RAG 与长期记忆',
	  '先做 AI 落地自测',
	  '文章学习路径',
	  '精选系列',
	  '公开文章边界',
	  '从文章到下一步',
	  '全部 AI 文章',
	  '网站有内容，不转化',
	  '先看 AI 获客站改造',
	  '/blog/ai-website-acquisition-system-2026/',
	  '先看 Coffee Chat 复盘模板',
	  '/blog/shanghai-ai-coffee-chat-recap-template/',
	  '把你的问题拆成一个能落地的小项目',
	]) {
    check(html.includes(term), `blog index is missing scenario reading guide: ${term}`);
  }
  for (const term of ['个人 AI 工作台', '长期记忆', '办公流程沉淀成 Skill', '内容自动化与 AI 商业化', 'OpenClaw 落地与风控']) {
    check(html.includes(term), `blog index is missing learning-track term: ${term}`);
  }
  for (const term of ['带一个流程做自测', '看知识库整理', '看 Skill 定制', '看公开样例库', '看系统陪跑']) {
    check(html.includes(term), `blog index is missing learning-track action: ${term}`);
  }
  const trackActionLinks = html.match(/class="track-action"/g)?.length ?? 0;
  check(trackActionLinks >= 5, `blog index should expose at least 5 learning-track action links, got ${trackActionLinks}.`);
  check(html.includes('复制咨询模板'), 'blog index is missing copyable consultation template CTA.');
  check(html.includes('复制微信号'), 'blog index is missing copyable WeChat ID CTA.');
  check(html.includes('/coffee-chat'), 'blog index is missing Coffee Chat conversion path.');
  check(!html.includes('busuanzi.ibruce.info'), 'blog index should not request per-post Busuanzi page views.');
}

if (exists('dist/index.html')) {
  const html = read('dist/index.html');
  for (const term of [
    'AI 实战文章',
    '查看文章库',
    '可复用 Skills 与 SOP',
    '查看 Skill 样例',
    '本地 AI 系统长期实测',
    '查看项目看板',
    '线下 Coffee Chat 承接',
    '查看活动入口',
    'AI 首步分流',
    '从这里开始',
    '先判断你现在该点哪里',
    '不用一上来就想清楚要买什么服务',
    '先自学，不急着咨询',
    '领取资料卡',
    '有一个重复流程',
    '做 3 分钟自测',
    '想先判断可信度',
    '看公开样例库',
    '在上海想当面拆',
    '约 Coffee Chat',
    '脱敏交付案例',
    '公开证据链',
    '脱敏输入',
    '前后对照',
    '公开产物',
    '交付物',
    '验收指标',
    '边界说明',
    '沉淀结果',
    '适合谁',
    '最近校验',
    `${blogFiles.length} 篇 AI 垂直文章`,
    `${blogImages.length} 张本地图片资产`,
    '脱敏替换图片',
    '查看公开样例',
  ]) {
    check(html.includes(term), `home proof showcase is missing case-card term: ${term}`);
  }
  const heroProofPattern = new RegExp(`<strong[^>]*>${blogFiles.length}</strong>\\s*<span[^>]*>AI 实战文章</span>`);
  check(heroProofPattern.test(html), 'home hero proof strip is missing current AI article count.');
  const heroProofLinks = html.match(/class="proof-item"/g)?.length ?? 0;
  check(heroProofLinks >= 4, `home hero proof strip should expose at least 4 evidence links, got ${heroProofLinks}.`);
  const firstStepCards = html.match(/class="first-step-card"/g)?.length ?? 0;
  check(firstStepCards >= 4, `home first-step section should expose at least 4 route cards, got ${firstStepCards}.`);
  const proofEvidenceLinks = html.match(/class="evidence-link"/g)?.length ?? 0;
  check(proofEvidenceLinks >= 6, `home proof showcase should expose at least 6 evidence links, got ${proofEvidenceLinks}.`);
  const redactedStatPattern = new RegExp(`<strong[^>]*>${redactedImageCount}</strong>\\s*<span[^>]*>脱敏替换图片</span>`);
  check(redactedImageCount === 0 || redactedStatPattern.test(html), 'home proof showcase is missing current redacted image count.');
  check(html.includes('先用一个具体流程判断能不能落地'), 'home page is missing bottom conversion CTA.');
  check(html.includes('/cases') && html.includes('公开样例库'), 'home page is missing public case library link.');
}

if (exists('dist/services/index.html')) {
  const html = read('dist/services/index.html');
  for (const term of ['公开证据链', '脱敏输入', '前后对照', '公开产物', '验收指标', '边界说明', '沉淀结果', `${blogFiles.length} 篇 AI 垂直文章`, `${blogImages.length} 张本地图片资产`]) {
    check(html.includes(term), `services proof showcase is missing case-card term: ${term}`);
  }
  const proofEvidenceLinks = html.match(/class="evidence-link"/g)?.length ?? 0;
  check(proofEvidenceLinks >= 6, `services proof showcase should expose at least 6 evidence links, got ${proofEvidenceLinks}.`);
}

if (exists('dist/coffee-chat/index.html')) {
  const html = read('dist/coffee-chat/index.html');
  for (const term of [
    '首屏报名入口',
    '带一个真实问题来，当场拆成下一步',
    '适合谁 / 你会得到什么 / 如何报名',
    '先做自测再约线下',
    '直接复制报名话术',
    '不需要提交表单',
    '近期可聊主题',
	  '候补主题池',
	  '复制主题报名卡',
	  '线索类型：上海 AI Coffee Chat / 主题报名',
	  '来源：ailaoming.com/coffee-chat#topic-',
	  'Coffee Chat 主题报名 - 个人 AI 工作台拆解',
	  'Coffee Chat 主题报名 - 知识库与 RAG 诊断',
	  'Coffee Chat 主题报名 - 内容商业化小闭环',
	  'Coffee Chat 主题报名 - 办公自动化 Skill 设计',
	  '我能提供的脱敏样例是：',
	  '复制内容会自动带主题来源、线索类型、预算意向、启动时间和隐私边界',
	  '下一场候补排期',
	  '先看主题是否成熟，再决定线下还是线上',
	  '不是固定日历',
	  '成局条件',
	  '会前材料',
	  '现场输出',
	  '公开沉淀',
	  '滚动招募',
	  '优先排期',
	  '等候同主题',
	  '小项目预筛',
	  '复制对应主题报名卡',
	  '到场前准备',
    '报名信息四件套',
	  '适合带来的 5 类问题',
	  '线下后如何转服务',
	  '报名路线图',
	  '组局成熟度',
	  '活动承诺',
	  '一对一深聊',
	  '小型闭门局',
	  '线上预沟通',
	  '不硬凑人数',
	  '不现场收私密材料',
	  '不只聊概念',
	  '活动样板',
	  '个人 AI 工作台拆解局',
	  '知识库与 RAG 预诊断局',
	  '内容商业化闭环局',
	  '会后复盘模板',
	  '公开复盘台账',
	  '有线索就如实记录，没有复盘就不伪装成战报',
	  '私域线索',
	  '公开复盘',
	  'AI 短剧与内容商业化',
	  '私域预约线索，未形成公开复盘',
	  '只确认出现过 AI 短剧相关 Coffee Chat 预约意向',
	  '不把预约线索包装成活动战报',
	  '不把私人聊天包装成案例背书',
	  '可公开结论',
	  '下次组局依据',
	  '运营节奏',
	  '组局触发',
	  '会前筛选',
	  '会中收束',
	  '会后沉淀',
	  '转服务判断',
	  '看完整 Coffee Chat 复盘模板文章',
	  '/blog/shanghai-ai-coffee-chat-recap-template/',
	    '复制 Coffee Chat 报名话术',
	    'Coffee Chat 报名',
	    '微信号：soplaoming',
	    '报名备注：Coffee Chat 报名',
	    '来源：ailaoming.com/coffee-chat',
	    '线索类型：上海 AI Coffee Chat',
	    '预算意向：',
	    '期望启动时间：',
	    '是否接受先诊断再项目：',
	    '隐私边界：我会先用脱敏方式描述问题',
	    '复制内容会自动带来源、线索类型、预算意向、启动时间和隐私边界',
	  ]) {
	    check(html.includes(term), `coffee chat signup page is missing section: ${term}`);
	  }
	  const coffeeCopyButtons = html.match(/class="copy-signup"/g)?.length ?? 0;
	  check(coffeeCopyButtons >= 2, `coffee chat page should expose signup copy actions in hero and detail sections, got ${coffeeCopyButtons}.`);
	  const topicCopyButtons = html.match(/class="copy-topic-signup"/g)?.length ?? 0;
	  check(topicCopyButtons >= 4, `coffee chat page should expose topic signup copy actions, got ${topicCopyButtons}.`);
	  const topicCopyTemplates = html.match(/class="topic-copy-template"/g)?.length ?? 0;
	  check(topicCopyTemplates >= 4, `coffee chat page should expose manual topic signup copy templates, got ${topicCopyTemplates}.`);
	  const scheduleCards = html.match(/class="schedule-head"/g)?.length ?? 0;
	  check(scheduleCards >= 4, `coffee chat page should expose at least 4 next-session pipeline cards, got ${scheduleCards}.`);
	  const signupCopyNotes = html.match(/class="signup-copy-note"/g)?.length ?? 0;
	  check(signupCopyNotes >= 2, `coffee chat page should explain enriched signup copy fields in both signup sections, got ${signupCopyNotes}.`);
	  const topicCopyNotes = html.match(/class="topic-copy-note"/g)?.length ?? 0;
	  check(topicCopyNotes >= 4, `coffee chat page should explain enriched topic signup copy fields, got ${topicCopyNotes}.`);
	  check(html.includes('"@type":"EventSeries"'), 'coffee chat page is missing EventSeries JSON-LD.');
	  check(html.includes('OfflineEventAttendanceMode'), 'coffee chat page is missing offline event attendance mode.');
	}

if (exists('dist/services/index.html')) {
  const html = read('dist/services/index.html');
  for (const term of ['服务决策表', '交付物对照', '典型信号', '小项目交付', '系统陪跑', '不适合']) {
    check(html.includes(term), `services page is missing service-decision term: ${term}`);
  }
  for (const term of ['看诊断服务', '看 Skill/SOP 小项目', '看 Skill 样例', '看 RAG 方法', '测资料基础', '看项目看板', '先聊小闭环', '看交付流程']) {
    check(html.includes(term), `services page is missing package action term: ${term}`);
  }
  const packageActionLinks = html.match(/class="package-actions"/g)?.length ?? 0;
  check(packageActionLinks >= 4, `services page should expose per-package action links, got ${packageActionLinks}.`);
  for (const term of [
    '服务样例与验收边界',
    '公开样例',
    '首次材料',
    '可交付验收',
    '暂不适合',
    'AI 获客站诊断',
    '个人网站从文章归档升级为 AI 获客系统',
    '看获客站诊断',
    'AI 获客站改造与落地自测',
    'Word 格式保真与报销材料整理 Skill',
    'RAG 与长期记忆库',
    '看 Memory OS',
    'AI 项目交付流程',
    'Codex 长程任务协作',
    '先跑通一个小闭环',
  ]) {
    check(html.includes(term), `services page is missing proof-to-delivery term: ${term}`);
  }
  for (const term of [
    '第一次合作怎么开始',
    '最小成交入口',
    '合作门槛',
    '升级条件',
    '先用 ROI 估算器判断值不值',
    '先拿资料卡补齐线索',
    '先从一次流程诊断开始',
    '想当面拆先 Coffee Chat',
    '3-8 人先做小型工作坊预审',
    '内容不转化',
    '先看 AI 获客站诊断',
    '看工作坊预审',
    '不是所有需求都直接进入项目',
    '/roi-calculator',
    '/workshop',
    '/ai-acquisition',
    '/products#resource-skill-brief',
  ]) {
    check(html.includes(term), `services page is missing first-deal term: ${term}`);
  }
  for (const term of [
    '预算口径与成交筛选',
    'Commercial Fit',
    '预算口径',
    '启动条件',
    '本次输出',
    '暂缓信号',
    'Coffee Chat / 预诊断',
    'AI 小型工作坊',
    'AI 工作流诊断',
    'Skill / SOP 交付',
    'AI 系统落地陪跑',
  ]) {
    check(html.includes(term), `services page is missing commercial-fit term: ${term}`);
  }
  const serviceProofLinks = html.match(/class="service-proof-link"/g)?.length ?? 0;
  check(serviceProofLinks >= 4, `services page should expose at least 4 service proof links, got ${serviceProofLinks}.`);
  const firstDealCards = html.match(/class="first-deal-link"/g)?.length ?? 0;
  check(firstDealCards >= 4, `services page should expose at least 4 first-deal route links, got ${firstDealCards}.`);
  check(html.includes('/cases') && html.includes('看完整公开样例库'), 'services page is missing case library route.');
}

if (exists('dist/cases/index.html')) {
  const html = read('dist/cases/index.html');
  for (const term of [
    '公开样例库',
    '脱敏输入',
    '处理动作',
    '公开产物',
    '验收口径',
    '边界说明',
    '服务路径',
    '不公开',
    '个人网站从文章归档升级为 AI 获客系统',
    'AI 获客站诊断',
    '报销材料整理 Skill',
    'Word 文档格式保真 SOP',
    '个人知识库与 RAG 预诊断',
    'AI 学习陪练公开样例',
    '公开文章：AI 学习陪练公开样例',
    '/blog/ai-exam-coach-template-law-exam/',
    'AI 投研复盘公开样例',
    '公开文章：AI 投研复盘公开样例',
    '/blog/ai-investment-research-journal-template/',
    '上海 AI Coffee Chat 复盘模板',
    '公开文章：Coffee Chat 复盘模板',
    '私域线索已出现，公开复盘待沉淀',
    'Coffee Chat 页公开复盘台账',
    'Git 版长期记忆库 OS',
    'AI 长期记忆库 OS',
    '/memory-os',
    '本地 Skill 资产盘点与公开陈列区',
    'Skill 资产 / 商业展示',
    '公开矩阵已上线',
    '公开页面：Skills 本地资产盘点',
    '/skills',
    '11 张本地 Skill 资产卡',
    '不公开本地路径、原始 Skill 全文、公司信息、真名、内部模板、后台数据、报销单据、周报原文和未授权业务材料',
    'GitHub：baoxiao.skill',
    'GitHub：RAG Memory System',
    'GitHub：公开主页',
    'L4 可复跑流程',
    'L3 开源样例',
    'L2 公开文章',
    'L1 运营模板',
    '按你的问题先选一类样例',
    '文档和办公流程',
    '知识库和长期记忆',
    '内容商业化和获客站',
    '学习陪练和研究复盘',
    '上海 Coffee Chat / 预诊断',
    'Skill 资产陈列和脱敏发布',
    '看办公 Skill 样例',
    '走 Skill/SOP 小项目',
    '看 RAG 预诊断样例',
    '走知识库治理',
    '/ai-acquisition',
    '看获客站诊断',
    '看 Coffee Chat 模板',
    '看 Skill 资产盘点',
    '看 Skills 页',
    '如何使用样例库',
    '原始私密材料',
    '带一个类似样例来判断能不能做',
  ]) {
    check(html.includes(term), `cases page is missing public sample term: ${term}`);
  }
  const scenarioCards = html.match(/class="scenario-card"/g)?.length ?? 0;
  check(scenarioCards >= 6, `cases page should expose at least 6 scenario guide cards, got ${scenarioCards}.`);
  const caseLinks = html.match(/class="case-link"/g)?.length ?? 0;
  check(caseLinks >= 9, `cases page should expose at least 9 public sample evidence links, got ${caseLinks}.`);
  check(html.includes('"@type":"CollectionPage"'), 'cases page is missing CollectionPage JSON-LD.');
  check(html.includes('/diagnosis') && html.includes('/services') && html.includes('/ai-acquisition'), 'cases page is missing conversion routes.');
}

if (exists('dist/skills/index.html')) {
  const html = read('dist/skills/index.html');
  for (const term of [
    '先判断你是哪类需求',
    'Skill 选型表',
    '首次发我这些材料',
    '首批材料',
    '验收口径',
    '文档自动化包',
    '内容生产包',
    '知识库治理包',
    '3 分钟自测',
    '看知识库治理',
    '看文档自动化包',
    '看内容生产入口',
    '首次沟通材料包',
    '复制 Skill 咨询话术',
    '本地 Skill 资产盘点',
    '公开展示版',
    '不展示公司、真名、报销单据、周报原文',
    'Excel 模型与数据表',
    '正式会议纪要',
    '来访日程 / 接待方案',
    '学术图表与流程图',
    '学术 PPT / 讲稿',
    '正式 Word / 论文风',
    '网文生产流水线',
    '周报与工作总结结构化',
    '只展示通用结构',
    'Skill 选型',
    '公开证据',
    'L1 方法框架',
    'L2 公开文章',
    'L3 开源样例',
    'L4 可复跑流程',
    'AI Word Skill 方法样例',
    '报销 Skill 28 个版本',
    '去 AI 味写作 SOP',
    '个人站获客系统改造',
    '长期记忆库项目看板',
    '文章转漫画 Skill',
    'Frontend Slides Skill',
  ]) {
    check(html.includes(term), `skills page is missing skill-selection term: ${term}`);
  }
  const skillProofLinks = html.match(/class="skill-proof-link"/g)?.length ?? 0;
  check(skillProofLinks >= 8, `skills page should expose at least 8 skill proof links, got ${skillProofLinks}.`);
  const localSkillCards = html.match(/class="local-skill-card"/g)?.length ?? 0;
  check(localSkillCards >= 11, `skills page should expose at least 11 local skill asset cards, got ${localSkillCards}.`);
  check(html.includes('不展示公司抬头、税号、真名') || html.includes('不展示公司、真名'), 'skills page is missing reimbursement or weekly-report privacy boundary.');
}

if (exists('dist/about/index.html')) {
  const html = read('dist/about/index.html');
  for (const term of [
    '公开可信锚点',
    '公开文章库',
    'Skill 样例',
    '项目看板',
    '线下入口',
    '技术交付',
    '公开身份边界',
    '不会写入网站',
    '上海 Coffee Chat',
    'Git 版长期记忆库 OS',
  ]) {
    check(html.includes(term), `about page is missing trust anchor term: ${term}`);
  }
}

if (exists('dist/products/index.html')) {
  const html = read('dist/products/index.html');
  for (const term of [
    '资料卡说明',
    'AI 工具 7 天路线',
    'Skill 样例清单',
    '知识库整理自查表',
    '内容自动化起步包',
    '领取方式',
    '资料领取路线图',
    '按当前状态选一张资料卡',
    '刚开始系统用 AI',
    '有重复流程但说不清',
    '资料很多但用不起来',
    '内容想转成服务入口',
    '选 AI 工具 7 天实践路线',
    '选 Skill 首次需求模板',
    '选知识库整理自查清单',
    '选内容商业化闭环画布',
    '看知识库治理',
    '看公开样例库',
    '资料成熟度',
    '公开预览中',
    '可预览',
    '可用于预诊断',
    '站点实战中',
    'L1 入门路线',
    'L2 脱敏样例',
    'L2 自查清单',
    'L3 公开流程',
    '样例预览',
    '预期交付',
    '使用边界',
    '适合领取',
    '下一步动作',
    '自助资料卡',
    '先复制一张轻量资料卡',
    '微信号：soplaoming',
    '资料卡备注：',
    '来源：ailaoming.com/products',
    '当前场景：',
    '希望下一步：',
    '隐私边界：',
    '不直接发送原始敏感材料',
    '资料卡-Skill 首次需求模板',
    'AI 工具 7 天实践路线',
    'Skill 首次需求模板',
    '知识库整理自查清单',
    '内容商业化闭环画布',
    '可直接复制',
    '复制领取话术',
    'Clipboard unavailable',
    '看 AI 获客站诊断',
    'AI 获客站诊断',
    '/ai-acquisition',
    'Coffee Chat / 工作坊 / 服务页',
    '项目制服务入口',
    '资料卡公开预览样例',
    '先看两张可直接照填的公开样例',
    '下面不是完整版资料包，而是公开预览',
    'Skill 首次需求模板公开版',
    '知识库整理自查表公开版',
    '来自站内 Word SOP、报销材料整理和去 AI 味写作 Skill 的脱敏结构',
    '来自站内 RAG、长期记忆库和本地资料治理实践的脱敏检查口径',
    '任务名称',
    '重复频率',
    '输入材料',
    '目标输出',
    '验收口径',
    '人工接管点',
    '资料入口',
    '命名规则',
    '检索问题',
    '权限边界',
    '引用口径',
    '第一步整理',
  ]) {
    check(html.includes(term), `products page is missing lead magnet term: ${term}`);
  }
  const resourceCopyButtons = html.match(/class="copy-resource"/g)?.length ?? 0;
  check(resourceCopyButtons >= 4, `products page should expose at least 4 self-serve resource copy buttons, got ${resourceCopyButtons}.`);
  const resourceChoiceCards = html.match(/class="resource-choice-card"/g)?.length ?? 0;
  check(resourceChoiceCards >= 4, `products page should expose at least 4 resource choice cards, got ${resourceChoiceCards}.`);
  const previewSampleCards = html.match(/id="preview-/g)?.length ?? 0;
  check(previewSampleCards >= 2, `products page should expose at least 2 public preview sample cards, got ${previewSampleCards}.`);
}

if (exists('dist/projects/index.html')) {
  const html = read('dist/projects/index.html');
  check(html.includes('看完项目，看你的流程能不能落地'), 'projects page is missing bottom conversion CTA.');
  check(html.includes('复制咨询模板'), 'projects page CTA is missing copyable consultation template.');
  for (const term of [
    'AI 网文生产流水线',
    'AI 法考备考系统',
    'AI 投研与投资复盘助手',
    'Git 版长期记忆库 OS',
    '公开页面：AI 长期记忆库 OS',
    '/memory-os',
    '证据等级说明',
    'L1 方法框架',
    'L2 公开文章',
    'L3 站点事实',
    'L4 可复跑流程',
    '证据等级',
    '可公开范围',
    '已验证成果',
    '公开进度',
    '公开证据',
    '可咨询方向',
    '不公开',
    '本月公开里程碑',
    'AI-only 站点收敛',
    'AI 获客站诊断',
    'Coffee Chat 复盘模板',
    'AI 学习陪练模板',
    '公开运营看板',
    '最近公开更新',
    '下次检查点',
    '服务入口',
    '暂缓边界',
    '章节账本',
    '错题回收资料卡',
    '研究日志模板',
    'Git 记忆仓库',
    'RAG 预诊断',
    '内容自动化起步包',
    '发布审批包',
    '/ai-acquisition',
    '看获客站诊断',
    'AI 学习陪练公开样例',
    '学习陪练样例',
    '/blog/ai-exam-coach-template-law-exam/',
    'AI 投研复盘公开样例',
    '研究日志样例',
    '/blog/ai-investment-research-journal-template/',
    '项目到服务映射',
    '外部类似问题',
    '推荐入口',
    '可交付结果',
    '内容自动化起步包',
    '知识库整理自查表',
    'Skill 首次需求模板',
    '查看公开证据',
    '带类似问题自测',
  ]) {
    check(html.includes(term), `projects page is missing project-board term: ${term}`);
  }
  const projectActionLinks = html.match(/class="track-actions"/g)?.length ?? 0;
  check(projectActionLinks >= 7, `projects page should expose per-project action links, got ${projectActionLinks}.`);
  const projectOpsCards = html.match(/class="ops-card"/g)?.length ?? 0;
  check(projectOpsCards >= 7, `projects page should expose at least 7 public operations cards, got ${projectOpsCards}.`);
}

if (exists('dist/index.html')) {
  const html = read('dist/index.html');
  check(html.includes('开始'), 'header is missing start-here nav label.');
  check(html.includes('AI 自测'), 'header is missing prioritized diagnosis nav label.');
  check(html.includes('需求卡'), 'header is missing consultation brief nav label.');
  check(html.includes('合作'), 'header is missing cooperation/pricing nav label.');
  check(html.includes('交付'), 'header is missing delivery nav label.');
  check(html.includes('上海'), 'header is missing Shanghai local service nav label.');
  check(html.includes('工作坊'), 'header is missing workshop nav label.');
  check(html.includes('信任'), 'header is missing trust center nav label.');
  check(html.includes('资料卡'), 'header is missing self-serve resource card nav label.');
  check(html.includes('获客'), 'header is missing AI acquisition nav label.');
  check(html.indexOf('href="/start"') < html.indexOf('href="/diagnosis"'), 'header should place start-here route before diagnosis.');
  check(html.indexOf('href="/diagnosis"') < html.indexOf('href="/brief"'), 'header should place consultation brief after diagnosis.');
  check(html.indexOf('href="/brief"') < html.indexOf('href="/services"'), 'header should place consultation brief before services.');
  check(html.indexOf('href="/services"') < html.indexOf('href="/ai-acquisition"'), 'header should place AI acquisition after services.');
  check(html.indexOf('href="/ai-acquisition"') < html.indexOf('href="/pricing"'), 'header should place pricing after AI acquisition.');
  check(html.indexOf('href="/pricing"') < html.indexOf('href="/delivery"'), 'header should place delivery after pricing.');
  check(html.indexOf('href="/delivery"') < html.indexOf('href="/cases"'), 'header should place public samples after delivery.');
  check(html.indexOf('href="/diagnosis"') < html.indexOf('href="/products"'), 'header should prioritize diagnosis before product navigation.');
  check(html.indexOf('href="/cases"') < html.indexOf('href="/blog"'), 'header should present public samples before the article library.');
  check(html.indexOf('href="/blog"') < html.indexOf('href="/projects"'), 'header should keep project board secondary to the article library.');
  check(html.indexOf('href="/products"') < html.indexOf('href="/coffee-chat"'), 'header should keep Coffee Chat as a secondary route after resource cards.');
  check(html.indexOf('href="/coffee-chat"') < html.indexOf('href="/workshop"'), 'header should place workshop after Coffee Chat.');
  check(html.indexOf('href="/workshop"') < html.indexOf('href="/shanghai-ai"'), 'header should place Shanghai local route after workshop.');
  check(html.indexOf('href="/shanghai-ai"') < html.indexOf('href="/trust"'), 'header should place trust center after Shanghai local route.');
}

const articleHtmlPath = 'dist/blog/codex-pro-200-dollar-how-i-use-it/index.html';
if (exists(articleHtmlPath)) {
  const html = read(articleHtmlPath);
  check(html.includes('property="og:type" content="article"'), 'sample article is missing og:type=article.');
  check(html.includes('property="article:published_time"'), 'sample article is missing article:published_time.');
  check(html.includes('/images/blog/codex-pro-200-dollar-how-i-use-it-wechat-01.png'), 'sample article does not use its hero image for social sharing.');
  check(html.includes('"@type":"BlogPosting"'), 'sample article is missing BlogPosting JSON-LD.');
  check(html.includes('读完这篇，下一步可以拆你的真实流程'), 'sample article is missing bottom conversion CTA.');
  check(html.includes('/diagnosis'), 'sample article CTA is missing diagnosis link.');
}

const coffeeChatArticleHtmlPath = 'dist/blog/shanghai-ai-coffee-chat-recap-template/index.html';
if (exists(coffeeChatArticleHtmlPath)) {
  const html = read(coffeeChatArticleHtmlPath);
  for (const term of [
    '上海 AI Coffee Chat 复盘模板',
    '站内原创整理',
    '不是某一场活动的战报',
    '主题和参与边界',
    '共性问题',
    '可公开动作',
    '公开样例库',
    '不公开清单',
    '标准复盘模板',
    '/coffee-chat',
    '/diagnosis',
    '/cases',
  ]) {
    check(html.includes(term), `coffee chat recap article is missing term: ${term}`);
  }
  check(html.includes('/images/blog/shanghai-ai-coffee-chat-recap-template-cover.svg'), 'coffee chat recap article is missing its hero image.');
  check(html.includes('"@type":"BlogPosting"'), 'coffee chat recap article is missing BlogPosting JSON-LD.');
}

const examCoachArticleHtmlPath = 'dist/blog/ai-exam-coach-template-law-exam/index.html';
if (exists(examCoachArticleHtmlPath)) {
  const html = read(examCoachArticleHtmlPath);
  for (const term of [
    'AI 学习陪练公开样例',
    '站内原创整理',
    '考点速通',
    '刷题纠错',
    '错题回收',
    '阶段复盘',
    '验收口径',
    '不公开题库原文',
    '不搬运付费课件',
    '不提供法律意见',
    'AI 落地自测',
  ]) {
    check(html.includes(term), `AI exam coach article is missing term: ${term}`);
  }
  check(html.includes('"@type":"BlogPosting"'), 'AI exam coach article is missing BlogPosting JSON-LD.');
  check(html.includes('/diagnosis'), 'AI exam coach article CTA is missing diagnosis link.');
}

const investmentJournalArticleHtmlPath = 'dist/blog/ai-investment-research-journal-template/index.html';
if (exists(investmentJournalArticleHtmlPath)) {
  const html = read(investmentJournalArticleHtmlPath);
  for (const term of [
    'AI 投研复盘公开样例',
    '站内原创整理',
    '观点、证据、风险和复盘',
    '研究日志的五栏结构',
    '当前观点',
    '支撑证据',
    '反方证据',
    '主要风险',
    '下次检查',
    '不公开账户信息',
    '不公开交易记录',
    '不推荐具体标的',
    '不提供投资建议',
    '长期研究资料库整理',
  ]) {
    check(html.includes(term), `AI investment journal article is missing term: ${term}`);
  }
  check(html.includes('"@type":"BlogPosting"'), 'AI investment journal article is missing BlogPosting JSON-LD.');
  check(html.includes('/diagnosis'), 'AI investment journal article CTA is missing diagnosis link.');
}

const homeHtmlPath = 'dist/index.html';
if (exists(homeHtmlPath)) {
  const html = read(homeHtmlPath);
  check(html.includes('property="og:type" content="website"'), 'home page is missing og:type=website.');
  check(html.includes('/images/blog/openclaw-one-stop-cover.jpg'), 'home page default social image is not the AI service image.');
}

if (exists('dist/robots.txt')) {
  const robots = read('dist/robots.txt');
  check(robots.includes('User-agent: *'), 'robots.txt is missing User-agent.');
  check(robots.includes('Allow: /'), 'robots.txt is missing Allow rule.');
  check(robots.includes('Sitemap: https://ailaoming.com/sitemap-index.xml'), 'robots.txt is missing sitemap URL.');
}

if (exists('dist/sitemap-0.xml')) {
  const sitemap = read('dist/sitemap-0.xml');
  const sitemapUrls = sitemap.match(/<loc>/g)?.length ?? 0;
  const expectedSitemapUrls = blogFiles.length + 22;
  check(sitemapUrls === expectedSitemapUrls, `sitemap URL count expected ${expectedSitemapUrls}, got ${sitemapUrls}.`);
  for (const route of requiredRoutes) {
    check(sitemap.includes(`https://ailaoming.com${route}`), `sitemap is missing ${route}.`);
  }
  const removedInSitemap = removedSlugPatterns.filter((slug) => sitemap.includes(slug));
  check(removedInSitemap.length === 0, `sitemap contains removed slugs: ${removedInSitemap.join(', ')}`);
}

if (exists('dist/rss.xml')) {
  const rss = read('dist/rss.xml');
  const items = rss.match(/<item>/g)?.length ?? 0;
  check(items === blogFiles.length, `RSS item count (${items}) does not match source blog count (${blogFiles.length}).`);
  const dates = [...rss.matchAll(/<pubDate>(.*?)<\/pubDate>/g)].map((match) => new Date(match[1]).getTime());
  check(dates.every((date, index) => index === 0 || dates[index - 1] >= date), 'RSS items are not sorted by pubDate descending.');
  const removedInRss = removedSlugPatterns.filter((slug) => rss.includes(slug));
  check(removedInRss.length === 0, `RSS contains removed slugs: ${removedInRss.join(', ')}`);
}

if (blogFiles.length === 0) warnings.push('no source blog posts found.');

const runtimeStatus = gitStatus(ignoredRuntimeFiles);
if (runtimeStatus) {
  warnings.push(`Astro runtime cache is dirty; exclude from release unless intentional: ${runtimeStatus.replace(/\n/g, '; ')}`);
}

console.log(JSON.stringify({
  ok: errors.length === 0,
  sourceBlogPosts: blogFiles.length,
  distBlogPages: distBlogDirs.length,
  publicBlogImages: blogImages.length,
  referencedBlogImages: imageRefs.size,
  unusedBlogImages: unusedImages.length,
  missingBlogImages: missingImages.length,
  internalLinksChecked,
  brokenInternalLinks: missingInternalLinks.length + missingInternalAnchors.length,
  warnings,
}, null, 2));

if (errors.length > 0) {
  console.error('\nRelease validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
