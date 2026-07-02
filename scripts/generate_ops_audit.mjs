import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const blogDir = 'src/content/blog';
const commercialPages = [
  { name: '首页', path: 'dist/index.html', route: '/' },
  { name: '开始', path: 'dist/start/index.html', route: '/start/' },
  { name: '服务', path: 'dist/services/index.html', route: '/services/' },
  { name: 'AI 获客站诊断', path: 'dist/ai-acquisition/index.html', route: '/ai-acquisition/' },
  { name: 'Skills', path: 'dist/skills/index.html', route: '/skills/' },
  { name: 'Skill/SOP 小项目', path: 'dist/skill-sop/index.html', route: '/skill-sop/' },
  { name: '项目', path: 'dist/projects/index.html', route: '/projects/' },
  { name: 'Memory OS', path: 'dist/memory-os/index.html', route: '/memory-os/' },
  { name: 'AI 自测', path: 'dist/diagnosis/index.html', route: '/diagnosis/' },
  { name: '工作流诊断', path: 'dist/workflow-diagnosis/index.html', route: '/workflow-diagnosis/' },
  { name: '需求卡', path: 'dist/brief/index.html', route: '/brief/' },
  { name: 'ROI 估算器', path: 'dist/roi-calculator/index.html', route: '/roi-calculator/' },
  { name: '合作方式', path: 'dist/pricing/index.html', route: '/pricing/' },
  { name: '交付流程', path: 'dist/delivery/index.html', route: '/delivery/' },
  { name: '信任边界', path: 'dist/trust/index.html', route: '/trust/' },
  { name: '上海本地服务', path: 'dist/shanghai-ai/index.html', route: '/shanghai-ai/' },
  { name: 'Coffee Chat', path: 'dist/coffee-chat/index.html', route: '/coffee-chat/' },
  { name: '工作坊', path: 'dist/workshop/index.html', route: '/workshop/' },
  { name: '公开样例库', path: 'dist/cases/index.html', route: '/cases/' },
  { name: '产品库', path: 'dist/products/index.html', route: '/products/' },
  { name: '关于', path: 'dist/about/index.html', route: '/about/' },
];

const categoryRules = [
  { name: 'RAG / 知识库 / 长期记忆', terms: ['RAG', '知识库', '记忆', 'Obsidian', '向量', '检索'] },
  { name: '办公 Skills / SOP', terms: ['Skill', 'SOP', 'Word', '报销', '会议纪要', '文档', '流程'] },
  { name: 'AI 写作 / 内容生产', terms: ['写作', '小说', '公众号', '小红书', '内容', '漫画'] },
  { name: 'AI 工具 / 编程工作台', terms: ['Codex', 'Claude', 'Cursor', 'Gemini', 'OpenClaw', 'GLM', 'Kimi'] },
  { name: 'AI 商业化 / 获客', terms: ['赚钱', '商业化', '获客', '服务', '产品'] },
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function runJsonScript(scriptPath) {
  try {
    const stdout = execFileSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, data: JSON.parse(stdout), error: '' };
  } catch (error) {
    const stdout = error.stdout?.toString() ?? '';
    let data = null;
    try {
      data = stdout ? JSON.parse(stdout) : null;
    } catch {
      data = null;
    }
    return {
      ok: false,
      data,
      error: error.stderr?.toString()?.trim() || error.message,
    };
  }
}

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).replace(/\s+$/, '');
}

function todayShanghai() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
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

function bulletList(items) {
  if (!items?.length) return '- 无';
  return items.map((item) => `- ${item}`).join('\n');
}

function table(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function includesAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function pageCoverage(page) {
  if (!exists(page.path)) {
    return {
      ...page,
      exists: false,
      hasWechat: false,
      hasTemplate: false,
      hasWechatCopy: false,
      hasDiagnosis: false,
      hasCoffeeChat: false,
      hasTrustBoundary: false,
      hasSkillLibrary: false,
      hasConsultationQualificationFields: false,
      hasQualifiedLeadFields: false,
      hasResourcePreviewSamples: false,
      hasFirstDealEntry: false,
      hasBudgetQualification: false,
      hasCoffeeChatSignupFields: false,
      hasCoffeeChatTopicSignup: false,
      hasCoffeeChatSessionPipeline: false,
      hasCoffeeChatEvidenceLedger: false,
      hasMemoryOs: false,
      hasWorkflowDiagnosis: false,
      hasSkillSopProject: false,
      hasProjectOpsBoard: false,
      hasDeliveryPlaybook: false,
      hasTrustCenter: false,
      hasConsultationBriefCards: false,
      hasRoiCalculator: false,
      hasPricingModel: false,
      hasAiAcquisition: false,
      hasShanghaiLocalEntry: false,
      hasWorkshop: false,
      hasStartRouter: false,
    };
  }

  const html = read(page.path);
  return {
    ...page,
    exists: true,
    hasWechat: html.includes('soplaoming'),
    hasTemplate: html.includes('复制咨询模板'),
    hasWechatCopy: html.includes('复制微信号'),
    hasDiagnosis: html.includes('/diagnosis'),
    hasCoffeeChat: html.includes('/coffee-chat') || html.includes('Coffee Chat'),
    hasTrustBoundary: html.includes('信任边界') || html.includes('公开边界') || html.includes('隐私边界') || html.includes('脱敏样例') || html.includes('验收口径'),
    hasSkillLibrary: html.includes('本地 Skill 资产盘点') && html.includes('公开展示版') && html.includes('Excel 模型与数据表') && html.includes('正式会议纪要') && html.includes('来访日程 / 接待方案') && html.includes('学术图表与流程图') && html.includes('学术 PPT / 讲稿') && html.includes('正式 Word / 论文风') && html.includes('网文生产流水线') && html.includes('周报与工作总结结构化') && html.includes('不展示公司、真名、报销单据、周报原文') && (html.match(/class="local-skill-card"/g)?.length ?? 0) >= 11,
    hasConsultationQualificationFields: html.includes('复制咨询模板') && html.includes('来源：ailaoming.com') && html.includes('预算意向：') && html.includes('期望启动时间：') && html.includes('是否接受先诊断再项目：') && html.includes('隐私边界：'),
    hasQualifiedLeadFields: html.includes('资料卡备注：') && html.includes('当前场景：') && html.includes('希望下一步：') && html.includes('隐私边界：'),
    hasResourcePreviewSamples: html.includes('资料卡公开预览样例') && html.includes('Skill 首次需求模板公开版') && html.includes('知识库整理自查表公开版') && html.includes('任务名称') && html.includes('资料入口') && (html.match(/id="preview-/g)?.length ?? 0) >= 2,
    hasFirstDealEntry: html.includes('第一次合作怎么开始') && html.includes('最小成交入口') && html.includes('合作门槛') && html.includes('升级条件') && html.includes('先看 AI 获客站诊断') && html.includes('/ai-acquisition'),
    hasBudgetQualification: html.includes('预算口径与成交筛选') && html.includes('预算口径') && html.includes('启动条件') && html.includes('暂缓信号'),
    hasCoffeeChatSignupFields: html.includes('报名备注：Coffee Chat 报名') && html.includes('来源：ailaoming.com/coffee-chat') && html.includes('线索类型：上海 AI Coffee Chat') && html.includes('预算意向：') && html.includes('期望启动时间：') && html.includes('是否接受先诊断再项目：') && html.includes('隐私边界：'),
    hasCoffeeChatTopicSignup: html.includes('复制主题报名卡') && html.includes('线索类型：上海 AI Coffee Chat / 主题报名') && html.includes('来源：ailaoming.com/coffee-chat#topic-') && html.includes('Coffee Chat 主题报名 - 个人 AI 工作台拆解') && html.includes('Coffee Chat 主题报名 - 知识库与 RAG 诊断') && html.includes('Coffee Chat 主题报名 - 内容商业化小闭环') && html.includes('Coffee Chat 主题报名 - 办公自动化 Skill 设计') && html.includes('我能提供的脱敏样例是：') && (html.match(/class="copy-topic-signup"/g)?.length ?? 0) >= 4,
    hasCoffeeChatSessionPipeline: html.includes('下一场候补排期') && html.includes('先看主题是否成熟，再决定线下还是线上') && html.includes('不是固定日历') && html.includes('成局条件') && html.includes('会前材料') && html.includes('现场输出') && html.includes('公开沉淀') && html.includes('滚动招募') && html.includes('优先排期') && html.includes('等候同主题') && html.includes('小项目预筛') && html.includes('复制对应主题报名卡') && (html.match(/class="schedule-head"/g)?.length ?? 0) >= 4,
    hasCoffeeChatEvidenceLedger: html.includes('公开复盘台账') && html.includes('私域预约线索，未形成公开复盘') && html.includes('不把预约线索包装成活动战报') && html.includes('不把私人聊天包装成案例背书'),
    hasMemoryOs: html.includes('AI 长期记忆库 OS') && html.includes('把上下文做成可维护资产') && html.includes('不是一坨资料，而是分层记忆系统') && html.includes('准入规则') && html.includes('排除规则') && html.includes('状态规则') && html.includes('隐私规则') && html.includes('v1.0') && html.includes('1.000') && html.includes('0.990') && html.includes('3.10') && html.includes('记忆架构诊断') && html.includes('Git 版上下文仓库') && html.includes('不展示真实记忆条目') && html.includes('/diagnosis') && html.includes('/coffee-chat') && html.includes('/services#knowledge-base') && html.includes('来源：ailaoming.com') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasWorkflowDiagnosis: html.includes('AI 工作流诊断') && html.includes('Workflow Diagnosis') && html.includes('先把一个流程拆清楚') && html.includes('5 步诊断流程') && html.includes('需求压缩') && html.includes('资料入口盘点') && html.includes('人机分工判断') && html.includes('路线图交付') && html.includes('诊断结束后，你应该拿到什么') && html.includes('四类常见诊断范围') && html.includes('复制诊断预审卡') && html.includes('来源：ailaoming.com/workflow-diagnosis') && html.includes('线索类型：AI 工作流诊断 / 预审') && html.includes('/diagnosis') && html.includes('/brief') && html.includes('/delivery') && html.includes('/pricing') && html.includes('/coffee-chat') && html.includes('/trust') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasSkillSopProject: html.includes('Skill/SOP 小项目') && html.includes('Skill / SOP Project') && html.includes('把重复任务做成可复跑资产') && html.includes('四类常见 Skill/SOP 模块') && html.includes('文档与格式保真') && html.includes('办公材料整理') && html.includes('内容生产流程') && html.includes('知识库与检索 SOP') && html.includes('5 步做成可复跑资产') && html.includes('Skill / SOP 固化') && html.includes('小项目交付物') && html.includes('验收矩阵') && html.includes('复制 Skill/SOP 小项目预审卡') && html.includes('来源：ailaoming.com/skill-sop') && html.includes('线索类型：Skill/SOP 小项目 / 预审') && html.includes('/workflow-diagnosis') && html.includes('/skills') && html.includes('/brief') && html.includes('/delivery') && html.includes('/coffee-chat') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasProjectOpsBoard: html.includes('公开运营看板') && html.includes('最近公开更新') && html.includes('下次检查点') && html.includes('服务入口') && html.includes('暂缓边界') && html.includes('章节账本') && html.includes('错题回收资料卡') && html.includes('研究日志模板') && html.includes('Git 记忆仓库') && html.includes('RAG 预诊断') && html.includes('内容自动化起步包') && html.includes('发布审批包') && (html.match(/class="ops-card"/g)?.length ?? 0) >= 7,
    hasDeliveryPlaybook: html.includes('AI 项目交付流程') && html.includes('从需求卡到可复跑闭环') && html.includes('6 步交付流程') && html.includes('需求卡收口') && html.includes('脱敏样例试跑') && html.includes('SOP / Skill 固化') && html.includes('本地验证与交付') && html.includes('四类交付物') && html.includes('交付前先看验收矩阵') && html.includes('项目启动前材料清单') && html.includes('复制启动预审卡') && html.includes('来源：ailaoming.com/delivery') && html.includes('线索类型：AI 项目交付流程 / 启动预审') && html.includes('/brief') && html.includes('/diagnosis') && html.includes('/pricing') && html.includes('/coffee-chat') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasTrustCenter: html.includes('AI 咨询信任与隐私边界') && html.includes('Trust Center') && html.includes('第一次只发脱敏材料') && html.includes('可以先发什么') && html.includes('不要直接发送什么') && html.includes('不提交表单') && html.includes('不上传、不存储') && html.includes('公开展示边界') && html.includes('脱敏材料准备卡') && html.includes('复制隐私边界卡') && html.includes('来源：ailaoming.com/trust') && html.includes('线索类型：AI 咨询隐私边界 / 脱敏材料准备') && html.includes('/brief') && html.includes('/delivery') && html.includes('/diagnosis') && html.includes('/coffee-chat') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasConsultationBriefCards: html.includes('AI 咨询需求卡') && html.includes('来源：ailaoming.com/brief') && html.includes('复制这张需求卡') && html.includes('AI 工作流诊断需求卡') && html.includes('AI 获客站诊断需求卡') && html.includes('Skill / SOP 小项目需求卡') && html.includes('个人知识库整理需求卡') && html.includes('上海 AI Coffee Chat 预约卡') && html.includes('上海 AI 小型工作坊预审卡') && html.includes('/ai-acquisition') && html.includes('/workshop'),
    hasRoiCalculator: html.includes('AI ROI 估算器') && html.includes('来源：ailaoming.com/roi-calculator') && html.includes('线索类型：AI ROI 估算 / 预算判断') && html.includes('复制 ROI 咨询摘要') && html.includes('手动复制摘要') && html.includes('roi-copy-preview') && html.includes('每周耗时') && html.includes('机会成本口径') && html.includes('返工比例') && html.includes('预计 AI 可节省比例') && html.includes('月度节省时间') && html.includes('月度释放价值') && html.includes('流程复杂度') && html.includes('单一文档') && html.includes('多步骤流程') && html.includes('多工具系统') && html.includes('不提交、不存储、不上传') && html.includes('预算意向：') && html.includes('隐私边界：'),
    hasPricingModel: html.includes('AI 合作方式与预算口径') && html.includes('来源：ailaoming.com/pricing') && html.includes('线索类型：AI 合作方式 / 预算口径') && html.includes('复制合作判断卡') && html.includes('公开页面不写死价格') && html.includes('AI 小型工作坊') && html.includes('AI 获客站诊断') && html.includes('/workshop') && html.includes('/ai-acquisition') && html.includes('预算口径') && html.includes('启动条件') && html.includes('暂缓信号'),
    hasAiAcquisition: html.includes('AI 获客站诊断') && html.includes('AI Acquisition Funnel') && html.includes('复制获客站诊断卡') && html.includes('来源：ailaoming.com/ai-acquisition') && html.includes('线索类型：AI 获客站诊断 / 内容转线索') && html.includes('内容入口') && html.includes('证据资产') && html.includes('自助判断') && html.includes('低摩擦联系') && html.includes('交流承接') && html.includes('服务交付') && html.includes('定位是否一句话说清') && html.includes('内容是否能导向下一步') && html.includes('证据是否能公开核验') && html.includes('线索是否足够合格') && html.includes('本地活动是否有承接') && html.includes('发布是否可控') && html.includes('AI 获客站诊断复盘台账') && html.includes('这里先记录本站自己的公开自诊断，不虚构合作案例') && html.includes('ailaoming.com 本站自诊断') && html.includes('Skill 资产公开化复盘') && html.includes('上海 Coffee Chat 承接路径') && html.includes('模板上线，等待真实复盘') && html.includes('不公开访客资料、私域聊天、未确认报价、后台数据、未授权原始材料和内部运营细节') && html.includes('本地发布清单') && html.includes('不承诺收益') && html.includes('不提交表单') && html.includes('不上传、不存储') && html.includes('预算意向：') && html.includes('隐私边界：') && html.includes('/cases') && html.includes('/diagnosis') && html.includes('/coffee-chat') && html.includes('/workshop') && html.includes('/brief') && html.includes('/services'),
    hasShanghaiLocalEntry: html.includes('上海 AI 工作流诊断与 Coffee Chat') && html.includes('来源：ailaoming.com/shanghai-ai') && html.includes('线索类型：上海本地 AI 咨询 / Coffee Chat') && html.includes('复制上海本地需求卡') && html.includes('上海 AI 小型工作坊') && html.includes('/workshop') && html.includes('线下只约交通方便的公开场所') && html.includes('不写具体私人地址') && html.includes('不承诺上门服务'),
    hasWorkshop: html.includes('上海 AI 小型工作坊') && html.includes('Shanghai AI Workshop') && html.includes('复制工作坊预审卡') && html.includes('来源：ailaoming.com/workshop') && html.includes('线索类型：上海 AI 小型工作坊 / 小团队内训预审') && html.includes('3-8 人') && html.includes('会前预审') && html.includes('边界确认') && html.includes('流程拆解') && html.includes('现场试跑') && html.includes('输出清单') && html.includes('会后沉淀') && html.includes('AI 工作流实战工作坊') && html.includes('知识库与 RAG 工作坊') && html.includes('办公 Skill/SOP 工作坊') && html.includes('内容商业化工作坊') && html.includes('不公开具体地点') && html.includes('不虚构已举办场次') && html.includes('预算意向：') && html.includes('隐私边界：') && html.includes('/diagnosis') && html.includes('/coffee-chat') && html.includes('/shanghai-ai') && html.includes('/brief'),
    hasStartRouter: html.includes('AI 首步分流') && html.includes('来源：ailaoming.com/start') && html.includes('线索类型：AI 首步分流') && html.includes('复制首步判断卡') && html.includes('先自学 / 资料卡') && html.includes('先做 AI 自测') && html.includes('复制需求卡') && html.includes('看合作方式') && html.includes('AI 获客站诊断') && html.includes('/ai-acquisition') && html.includes('上海 Coffee Chat') && html.includes('上海 AI 小型工作坊') && html.includes('/workshop') && html.includes('看服务方案') && html.includes('不提交表单') && html.includes('不上传、不存储'),
  };
}

function statusMark(value) {
  return value ? 'OK' : '缺失';
}

function contentFreshness(days) {
  if (days === null) {
    return {
      label: '无法判断',
      action: '先修复文章发布日期，再判断内容维护节奏。',
    };
  }
  if (days < 14) {
    return {
      label: '内容新鲜',
      action: '继续沉淀项目进度、Coffee Chat 复盘或可公开的 AI 实战小结。',
    };
  }
  if (days < 30) {
    return {
      label: '进入观察',
      action: '准备下一篇 AI 实战更新，避免商业站显得停更。',
    };
  }
  return {
    label: '需要补更',
    action: '优先发布一篇 AI 项目进度、服务复盘或 Coffee Chat 主题招募文章。',
  };
}

const date = todayShanghai();
const defaultOutput = `/private/tmp/ailaoming_ops_audit_${date}.md`;
const outputArgIndex = process.argv.indexOf('--output');
const outputPath = outputArgIndex >= 0 && process.argv[outputArgIndex + 1] ? process.argv[outputArgIndex + 1] : defaultOutput;

const health = runJsonScript('scripts/check_content_health.mjs');
const validation = runJsonScript('scripts/validate_site_release.mjs');
const candidates = runJsonScript('scripts/check_release_candidates.mjs');

const blogFiles = walk(blogDir, (file) => /\.(md|mdx)$/.test(file));
const posts = blogFiles.map((file) => {
  const text = read(file);
  const data = parseFrontmatter(text);
  const body = text.replace(/^---[\s\S]*?\n---\n?/, '');
  const haystack = [
    data.title,
    data.description,
    ...(Array.isArray(data.keywords) ? data.keywords : []),
    body.slice(0, 1200),
  ].filter(Boolean).join(' ');
  return {
    file,
    slug: path.basename(file).replace(/\.(md|mdx)$/, ''),
    title: data.title ?? path.basename(file),
    pubDate: data.pubDate,
    haystack,
  };
});

const latestPosts = [...posts]
  .filter((post) => !Number.isNaN(new Date(post.pubDate).getTime()))
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  .slice(0, 10);

const latestDate = latestPosts[0]?.pubDate ? new Date(latestPosts[0].pubDate) : null;
const daysSinceLatest = latestDate && !Number.isNaN(latestDate.getTime())
  ? Math.floor((Date.now() - latestDate.getTime()) / 86400000)
  : null;
const freshness = contentFreshness(daysSinceLatest);
const latestPost = latestPosts[0] ?? null;

const categoryRows = categoryRules.map((category) => {
  const matched = posts.filter((post) => includesAny(post.haystack, category.terms));
  const latest = matched
    .filter((post) => !Number.isNaN(new Date(post.pubDate).getTime()))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())[0];
  return {
    name: category.name,
    count: matched.length,
    latest: latest ? `${latest.pubDate} ${latest.title}` : '无',
  };
});

const pageRows = commercialPages.map(pageCoverage);
const pagesMissingCta = pageRows.filter((page) => page.exists && (!page.hasWechat || !page.hasTemplate || !page.hasWechatCopy));
const pagesMissingRoute = pageRows.filter((page) => page.exists && (!page.hasDiagnosis || !page.hasCoffeeChat));
const pagesMissingTrust = pageRows.filter((page) => page.exists && ['/', '/services/', '/ai-acquisition/', '/diagnosis/', '/workflow-diagnosis/', '/skill-sop/', '/roi-calculator/', '/shanghai-ai/', '/coffee-chat/', '/workshop/', '/memory-os/', '/delivery/', '/trust/'].includes(page.route) && !page.hasTrustBoundary);
const pagesMissingSkillLibrary = pageRows.filter((page) => page.exists && page.route === '/skills/' && !page.hasSkillLibrary);
const pagesMissingConsultationQualificationFields = pageRows.filter((page) => page.exists && page.hasTemplate && !page.hasConsultationQualificationFields);
const pagesMissingQualifiedLeadFields = pageRows.filter((page) => page.exists && page.route === '/products/' && !page.hasQualifiedLeadFields);
const pagesMissingResourcePreviewSamples = pageRows.filter((page) => page.exists && page.route === '/products/' && !page.hasResourcePreviewSamples);
const pagesMissingFirstDealEntry = pageRows.filter((page) => page.exists && page.route === '/services/' && !page.hasFirstDealEntry);
const pagesMissingBudgetQualification = pageRows.filter((page) => page.exists && page.route === '/services/' && !page.hasBudgetQualification);
const pagesMissingCoffeeChatSignupFields = pageRows.filter((page) => page.exists && page.route === '/coffee-chat/' && !page.hasCoffeeChatSignupFields);
const pagesMissingCoffeeChatTopicSignup = pageRows.filter((page) => page.exists && page.route === '/coffee-chat/' && !page.hasCoffeeChatTopicSignup);
const pagesMissingCoffeeChatSessionPipeline = pageRows.filter((page) => page.exists && page.route === '/coffee-chat/' && !page.hasCoffeeChatSessionPipeline);
const pagesMissingCoffeeChatEvidenceLedger = pageRows.filter((page) => page.exists && page.route === '/coffee-chat/' && !page.hasCoffeeChatEvidenceLedger);
const pagesMissingMemoryOs = pageRows.filter((page) => page.exists && page.route === '/memory-os/' && !page.hasMemoryOs);
const pagesMissingWorkflowDiagnosis = pageRows.filter((page) => page.exists && page.route === '/workflow-diagnosis/' && !page.hasWorkflowDiagnosis);
const pagesMissingSkillSopProject = pageRows.filter((page) => page.exists && page.route === '/skill-sop/' && !page.hasSkillSopProject);
const pagesMissingProjectOpsBoard = pageRows.filter((page) => page.exists && page.route === '/projects/' && !page.hasProjectOpsBoard);
const pagesMissingDeliveryPlaybook = pageRows.filter((page) => page.exists && page.route === '/delivery/' && !page.hasDeliveryPlaybook);
const pagesMissingTrustCenter = pageRows.filter((page) => page.exists && page.route === '/trust/' && !page.hasTrustCenter);
const pagesMissingConsultationBriefCards = pageRows.filter((page) => page.exists && page.route === '/brief/' && !page.hasConsultationBriefCards);
const pagesMissingRoiCalculator = pageRows.filter((page) => page.exists && page.route === '/roi-calculator/' && !page.hasRoiCalculator);
const pagesMissingPricingModel = pageRows.filter((page) => page.exists && page.route === '/pricing/' && !page.hasPricingModel);
const pagesMissingAiAcquisition = pageRows.filter((page) => page.exists && page.route === '/ai-acquisition/' && !page.hasAiAcquisition);
const pagesMissingShanghaiLocalEntry = pageRows.filter((page) => page.exists && page.route === '/shanghai-ai/' && !page.hasShanghaiLocalEntry);
const pagesMissingWorkshop = pageRows.filter((page) => page.exists && page.route === '/workshop/' && !page.hasWorkshop);
const pagesMissingStartRouter = pageRows.filter((page) => page.exists && page.route === '/start/' && !page.hasStartRouter);

const healthCounts = health.data?.counts ?? {};
const validationData = validation.data ?? {};
const candidateCounts = candidates.data?.counts ?? {};
const redactedManifest = exists('scripts/redacted_image_manifest.json')
  ? JSON.parse(read('scripts/redacted_image_manifest.json'))
  : { items: [] };

const recommendations = [];
if (daysSinceLatest === null) {
  recommendations.push('文章日期无法判断，需要先修复内容 frontmatter。');
} else if (daysSinceLatest >= 30) {
  recommendations.push(`最新文章距今 ${daysSinceLatest} 天，建议补一篇 AI 项目进度或 Coffee Chat 复盘。`);
} else if (daysSinceLatest >= 14) {
  recommendations.push(`最新文章距今 ${daysSinceLatest} 天，建议准备下一篇 AI 实战更新，保持商业站活跃度。`);
}
if (pagesMissingCta.length) {
  recommendations.push(`以下商业页 CTA 不完整：${pagesMissingCta.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingRoute.length) {
  recommendations.push(`以下商业页缺少 AI 自测或 Coffee Chat 路径：${pagesMissingRoute.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingTrust.length) {
  recommendations.push(`以下关键页缺少信任边界表达：${pagesMissingTrust.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingSkillLibrary.length) {
  recommendations.push(`Skills 页缺少本地 Skill 资产盘点或脱敏边界：${pagesMissingSkillLibrary.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingConsultationQualificationFields.length) {
  recommendations.push(`以下商业页咨询模板缺少预算/时间/隐私筛选字段：${pagesMissingConsultationQualificationFields.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingQualifiedLeadFields.length) {
  recommendations.push(`资料卡页缺少合格线索字段：${pagesMissingQualifiedLeadFields.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingResourcePreviewSamples.length) {
  recommendations.push(`资料卡页缺少公开预览样例：${pagesMissingResourcePreviewSamples.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingFirstDealEntry.length) {
  recommendations.push(`服务页缺少最小合作入口：${pagesMissingFirstDealEntry.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingBudgetQualification.length) {
  recommendations.push(`服务页缺少预算口径与成交筛选：${pagesMissingBudgetQualification.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingCoffeeChatSignupFields.length) {
  recommendations.push(`Coffee Chat 页缺少完整报名线索字段：${pagesMissingCoffeeChatSignupFields.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingCoffeeChatTopicSignup.length) {
  recommendations.push(`Coffee Chat 页缺少主题报名卡：${pagesMissingCoffeeChatTopicSignup.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingCoffeeChatSessionPipeline.length) {
  recommendations.push(`Coffee Chat 页缺少下一场候补排期、成局条件或会后沉淀边界：${pagesMissingCoffeeChatSessionPipeline.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingCoffeeChatEvidenceLedger.length) {
  recommendations.push(`Coffee Chat 页缺少公开复盘台账或不虚构场次声明：${pagesMissingCoffeeChatEvidenceLedger.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingMemoryOs.length) {
  recommendations.push(`Memory OS 页缺少长期记忆库公开样例、评测指标或隐私边界：${pagesMissingMemoryOs.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingWorkflowDiagnosis.length) {
  recommendations.push(`工作流诊断页缺少诊断流程、预审卡或关键转化路径：${pagesMissingWorkflowDiagnosis.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingSkillSopProject.length) {
  recommendations.push(`Skill/SOP 小项目页缺少模块、验收矩阵、预审卡或关键转化路径：${pagesMissingSkillSopProject.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingProjectOpsBoard.length) {
  recommendations.push(`项目页缺少公开运营看板、下一次检查点或服务转化入口：${pagesMissingProjectOpsBoard.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingDeliveryPlaybook.length) {
  recommendations.push(`交付流程页缺少交付步骤、启动预审卡或验收边界：${pagesMissingDeliveryPlaybook.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingTrustCenter.length) {
  recommendations.push(`信任边界页缺少脱敏材料准备卡、公开展示边界或关键转化路径：${pagesMissingTrustCenter.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingConsultationBriefCards.length) {
  recommendations.push(`需求卡页缺少六类可复制咨询 Brief：${pagesMissingConsultationBriefCards.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingRoiCalculator.length) {
  recommendations.push(`ROI 估算器页缺少成本估算、复制摘要或隐私边界：${pagesMissingRoiCalculator.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingPricingModel.length) {
  recommendations.push(`合作方式页缺少预算口径或合作判断卡：${pagesMissingPricingModel.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingAiAcquisition.length) {
  recommendations.push(`AI 获客站诊断页缺少漏斗、预审卡或隐私边界：${pagesMissingAiAcquisition.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingShanghaiLocalEntry.length) {
  recommendations.push(`上海本地服务页缺少本地需求卡或隐私边界：${pagesMissingShanghaiLocalEntry.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingWorkshop.length) {
  recommendations.push(`工作坊页缺少预审卡、流程模块或隐私边界：${pagesMissingWorkshop.map((page) => page.route).join(', ')}。`);
}
if (pagesMissingStartRouter.length) {
  recommendations.push(`开始页缺少首步分流路径或判断卡：${pagesMissingStartRouter.map((page) => page.route).join(', ')}。`);
}
if (!recommendations.length) {
  recommendations.push('当前运营结构完整，下一步优先补充新文章、真实脱敏案例、获客站诊断复盘和 Coffee Chat 复盘。');
}

const hardOk = health.ok && validation.ok && candidates.ok && !pagesMissingCta.length && !pagesMissingRoute.length && !pagesMissingTrust.length && !pagesMissingSkillLibrary.length && !pagesMissingConsultationQualificationFields.length && !pagesMissingQualifiedLeadFields.length && !pagesMissingResourcePreviewSamples.length && !pagesMissingFirstDealEntry.length && !pagesMissingBudgetQualification.length && !pagesMissingCoffeeChatSignupFields.length && !pagesMissingCoffeeChatTopicSignup.length && !pagesMissingCoffeeChatSessionPipeline.length && !pagesMissingCoffeeChatEvidenceLedger.length && !pagesMissingMemoryOs.length && !pagesMissingWorkflowDiagnosis.length && !pagesMissingSkillSopProject.length && !pagesMissingProjectOpsBoard.length && !pagesMissingDeliveryPlaybook.length && !pagesMissingTrustCenter.length && !pagesMissingConsultationBriefCards.length && !pagesMissingRoiCalculator.length && !pagesMissingPricingModel.length && !pagesMissingAiAcquisition.length && !pagesMissingShanghaiLocalEntry.length && !pagesMissingWorkshop.length && !pagesMissingStartRouter.length;
const branchStatus = git(['status', '--short', '--branch']);
const currentBranch = candidates.data?.currentBranch ?? git(['branch', '--show-current']);

const markdown = `# ailaoming.com 运营审计摘要

生成时间：${date}
仓库：${root}
性质：本地只读运营审计；不 stage、不 commit、不 push。

## 1. 结论

- 运营审计：${hardOk ? '通过' : '需要处理'}
- 当前分支：${currentBranch}
- AI 文章数：${healthCounts.posts ?? posts.length}
- dist 博客页：${validationData.distBlogPages ?? '未知'}
- 图片引用：${validationData.referencedBlogImages ?? healthCounts.referencedImages ?? '未知'} / ${validationData.publicBlogImages ?? healthCounts.blogImages ?? '未知'}
- 未使用图片：${validationData.unusedBlogImages ?? healthCounts.unusedImages ?? '未知'}
- 脱敏图锁定：${redactedManifest.items?.length ?? 0} 张
- 发布候选文件：${candidateCounts.candidateFiles ?? '未知'} 个
- 运行时缓存排除：${candidateCounts.runtimeExcluded ?? '未知'} 个
- 最新文章距今：${daysSinceLatest ?? '未知'} 天
- 内容保鲜状态：${freshness.label}
- 最新文章：${latestPost ? `${latestPost.pubDate} /blog/${latestPost.slug}/ - ${latestPost.title}` : '未知'}

## 2. 商业页面转化覆盖

${table(
  ['页面', '路由', '微信', '咨询模板', '复制微信号', 'AI 自测', 'Coffee Chat', '信任边界', 'Skill资产', '咨询筛选', '开始分流', '需求卡', 'ROI 估算', '合作方式', '获客站诊断', '工作流诊断', 'Skill/SOP', '项目运营', '交付流程', '信任中心', '上海本地', '工作坊', '合格线索', '资料预览', '最小入口', '预算筛选', '报名线索', '主题报名', '候补排期', '复盘台账', 'Memory OS'],
  pageRows.map((page) => [
    page.name,
    page.route,
    statusMark(page.hasWechat),
    statusMark(page.hasTemplate),
    statusMark(page.hasWechatCopy),
    statusMark(page.hasDiagnosis),
    statusMark(page.hasCoffeeChat),
    statusMark(page.hasTrustBoundary),
    page.route === '/skills/' ? statusMark(page.hasSkillLibrary) : '不适用',
    page.hasTemplate ? statusMark(page.hasConsultationQualificationFields) : '不适用',
    page.route === '/start/' ? statusMark(page.hasStartRouter) : '不适用',
    page.route === '/brief/' ? statusMark(page.hasConsultationBriefCards) : '不适用',
    page.route === '/roi-calculator/' ? statusMark(page.hasRoiCalculator) : '不适用',
    page.route === '/pricing/' ? statusMark(page.hasPricingModel) : '不适用',
    page.route === '/ai-acquisition/' ? statusMark(page.hasAiAcquisition) : '不适用',
    page.route === '/workflow-diagnosis/' ? statusMark(page.hasWorkflowDiagnosis) : '不适用',
    page.route === '/skill-sop/' ? statusMark(page.hasSkillSopProject) : '不适用',
    page.route === '/projects/' ? statusMark(page.hasProjectOpsBoard) : '不适用',
    page.route === '/delivery/' ? statusMark(page.hasDeliveryPlaybook) : '不适用',
    page.route === '/trust/' ? statusMark(page.hasTrustCenter) : '不适用',
    page.route === '/shanghai-ai/' ? statusMark(page.hasShanghaiLocalEntry) : '不适用',
    page.route === '/workshop/' ? statusMark(page.hasWorkshop) : '不适用',
    page.route === '/products/' ? statusMark(page.hasQualifiedLeadFields) : '不适用',
    page.route === '/products/' ? statusMark(page.hasResourcePreviewSamples) : '不适用',
    page.route === '/services/' ? statusMark(page.hasFirstDealEntry) : '不适用',
    page.route === '/services/' ? statusMark(page.hasBudgetQualification) : '不适用',
    page.route === '/coffee-chat/' ? statusMark(page.hasCoffeeChatSignupFields) : '不适用',
    page.route === '/coffee-chat/' ? statusMark(page.hasCoffeeChatTopicSignup) : '不适用',
    page.route === '/coffee-chat/' ? statusMark(page.hasCoffeeChatSessionPipeline) : '不适用',
    page.route === '/coffee-chat/' ? statusMark(page.hasCoffeeChatEvidenceLedger) : '不适用',
    page.route === '/memory-os/' ? statusMark(page.hasMemoryOs) : '不适用',
  ]),
)}

## 3. 内容主题分布

${table(
  ['主题', '文章数', '最近一篇'],
  categoryRows.map((row) => [row.name, String(row.count), row.latest.replace(/\|/g, '/')]),
)}

## 4. 最近文章

${bulletList(latestPosts.map((post) => `${post.pubDate} /blog/${post.slug}/ - ${post.title}`))}

## 5. 现有验证结果

- npm run health:content：${health.ok ? '通过' : '未通过'}
- npm run validate:site：${validation.ok ? '通过' : '未通过'}
- npm run release:candidates：${candidates.ok ? '通过' : '未通过'}

${validation.data?.warnings?.length ? `validate:site warning：\n${bulletList(validation.data.warnings)}\n` : ''}

## 6. 下一步维护建议

${bulletList(recommendations)}

内容保鲜动作：${freshness.action}

## 7. Git 状态摘要

\`\`\`text
${branchStatus}
\`\`\`
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(JSON.stringify({
  ok: hardOk,
  outputPath,
  counts: {
    posts: healthCounts.posts ?? posts.length,
    commercialPages: pageRows.length,
    pagesMissingCta: pagesMissingCta.length,
    pagesMissingRoute: pagesMissingRoute.length,
    pagesMissingTrust: pagesMissingTrust.length,
    pagesMissingSkillLibrary: pagesMissingSkillLibrary.length,
    pagesMissingConsultationQualificationFields: pagesMissingConsultationQualificationFields.length,
    pagesMissingQualifiedLeadFields: pagesMissingQualifiedLeadFields.length,
    pagesMissingResourcePreviewSamples: pagesMissingResourcePreviewSamples.length,
    pagesMissingFirstDealEntry: pagesMissingFirstDealEntry.length,
    pagesMissingBudgetQualification: pagesMissingBudgetQualification.length,
    pagesMissingCoffeeChatSignupFields: pagesMissingCoffeeChatSignupFields.length,
    pagesMissingCoffeeChatTopicSignup: pagesMissingCoffeeChatTopicSignup.length,
    pagesMissingCoffeeChatSessionPipeline: pagesMissingCoffeeChatSessionPipeline.length,
    pagesMissingCoffeeChatEvidenceLedger: pagesMissingCoffeeChatEvidenceLedger.length,
    pagesMissingMemoryOs: pagesMissingMemoryOs.length,
    pagesMissingWorkflowDiagnosis: pagesMissingWorkflowDiagnosis.length,
    pagesMissingSkillSopProject: pagesMissingSkillSopProject.length,
    pagesMissingProjectOpsBoard: pagesMissingProjectOpsBoard.length,
    pagesMissingDeliveryPlaybook: pagesMissingDeliveryPlaybook.length,
    pagesMissingTrustCenter: pagesMissingTrustCenter.length,
    pagesMissingConsultationBriefCards: pagesMissingConsultationBriefCards.length,
    pagesMissingRoiCalculator: pagesMissingRoiCalculator.length,
    pagesMissingPricingModel: pagesMissingPricingModel.length,
    pagesMissingAiAcquisition: pagesMissingAiAcquisition.length,
    pagesMissingShanghaiLocalEntry: pagesMissingShanghaiLocalEntry.length,
    pagesMissingWorkshop: pagesMissingWorkshop.length,
    pagesMissingStartRouter: pagesMissingStartRouter.length,
    redactedImages: redactedManifest.items?.length ?? 0,
	    candidateFiles: candidateCounts.candidateFiles ?? null,
	    daysSinceLatest,
	    contentFreshness: freshness.label,
	  },
	  recommendations,
	}, null, 2));

if (!hardOk) process.exit(1);
