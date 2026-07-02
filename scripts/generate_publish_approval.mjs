import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function todayShanghai() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function bulletList(items) {
  if (!items?.length) return '- 无';
  return items.map((item) => `- ${item}`).join('\n');
}

function truncateList(items, limit = 80) {
  if (!items?.length) return [];
  if (items.length <= limit) return items;
  return [...items.slice(0, limit), `... 另有 ${items.length - limit} 项未展开，可用 npm run release:candidates 查看完整 JSON`];
}

const date = todayShanghai();
const defaultOutput = `/private/tmp/ailaoming_publish_approval_${date}.md`;
const outputArgIndex = process.argv.indexOf('--output');
const outputPath = outputArgIndex >= 0 && process.argv[outputArgIndex + 1] ? process.argv[outputArgIndex + 1] : defaultOutput;

const health = runJsonScript('scripts/check_content_health.mjs');
const validation = runJsonScript('scripts/validate_site_release.mjs');
const candidates = runJsonScript('scripts/check_release_candidates.mjs');
const opsAudit = runJsonScript('scripts/generate_ops_audit.mjs');
const manifest = readJson('scripts/redacted_image_manifest.json');

const branchStatus = git(['status', '--short', '--branch']);
const remotes = git(['remote', '-v']).split('\n').filter(Boolean);
const branches = git(['branch', '-vv']).split('\n').filter(Boolean);

const candidateCounts = candidates.data?.counts ?? {};
const healthCounts = health.data?.counts ?? {};
const validationData = validation.data ?? {};
const opsCounts = opsAudit.data?.counts ?? {};

const hardGateOk = health.ok && validation.ok && candidates.ok && opsAudit.ok;
const runtimeExcluded = candidates.data?.excludeFromRelease ?? [];
const deletedBlogPosts = candidates.data?.deletedBlogPosts ?? [];
const deletedBlogImages = candidates.data?.deletedBlogImages ?? [];
const untrackedFiles = candidates.data?.untrackedFiles ?? [];
const candidateFiles = candidates.data?.candidateFiles ?? [];

const markdown = `# ailaoming.com 本地发布审批摘要

生成时间：${date}
仓库：${root}
当前状态：仅生成本地审批摘要；脚本不 stage、不 commit、不 push。

## 1. 总体结论

- 发布硬门槛：${hardGateOk ? '通过' : '未通过'}
- 当前分支：${candidates.data?.currentBranch ?? '未知'}
- 发布候选文件：${candidateCounts.candidateFiles ?? '未知'} 个
- 建议纳入修改：${candidateCounts.modified ?? '未知'} 个
- 删除项：${candidateCounts.deleted ?? '未知'} 个
- 新增未跟踪候选：${candidateCounts.untracked ?? '未知'} 个
- 运行时缓存排除：${candidateCounts.runtimeExcluded ?? runtimeExcluded.length} 个
- 删除非 AI 文章：${candidateCounts.deletedBlogPosts ?? deletedBlogPosts.length} 篇
- 删除非 AI 图片：${candidateCounts.deletedBlogImages ?? deletedBlogImages.length} 张

## 2. 本轮定位

本轮本地版本继续把 ailaoming.com 维护为 AI 垂直商业获客站，承接：

- AI 首步分流
- AI 工作流诊断
- AI 落地自测
- AI 咨询需求卡
- AI 获客站诊断
- AI ROI 估算器
- AI 工作流诊断服务
- Skill/SOP 小项目
- AI 合作方式与预算口径
- AI 项目交付流程
- AI 咨询信任与隐私边界
- 上海本地 AI 工作流诊断与 Coffee Chat
- 上海 AI 小型工作坊
- AI 长期记忆库 OS
- 个人知识库整理
- 办公 Skills / SOP 定制
- AI 系统落地陪跑
- 上海 AI Coffee Chat
- 公开样例库
- AI 技术文章库

## 3. 验证结果

- npm run health:content：${health.ok ? '通过' : '未通过'}
- npm run validate:site：${validation.ok ? '通过' : '未通过'}
- npm run release:candidates：${candidates.ok ? '通过' : '未通过'}
- npm run ops:audit：${opsAudit.ok ? '通过' : '未通过'}${opsAudit.data?.outputPath ? `（${opsAudit.data.outputPath}）` : ''}
- 源码文章数：${validationData.sourceBlogPosts ?? healthCounts.posts ?? '未知'}
- dist 博客页：${validationData.distBlogPages ?? '未知'}
- public/images/blog 图片：${validationData.publicBlogImages ?? healthCounts.blogImages ?? '未知'}
- 被引用图片：${validationData.referencedBlogImages ?? healthCounts.referencedImages ?? '未知'}
- 未使用图片：${validationData.unusedBlogImages ?? healthCounts.unusedImages ?? '未知'}
- 缺失图片：${validationData.missingBlogImages ?? '未知'}
- 内容 hardProblems：${healthCounts.hardProblems ?? '未知'}
- 内容 softWarnings：${healthCounts.softWarnings ?? '未知'}
- 脱敏图片 manifest：${manifest.items?.length ?? 0} 张已登记，validate:site 已做 SHA-256 校验。
- 商业页缺 CTA：${opsCounts.pagesMissingCta ?? '未知'}
- 商业页缺 AI 自测/Coffee Chat 路径：${opsCounts.pagesMissingRoute ?? '未知'}
- 关键页缺信任边界：${opsCounts.pagesMissingTrust ?? '未知'}
- Skills 页缺本地资产盘点：${opsCounts.pagesMissingSkillLibrary ?? '未知'}
- 开始页缺首步分流：${opsCounts.pagesMissingStartRouter ?? '未知'}
- 咨询模板缺预算/时间筛选字段：${opsCounts.pagesMissingConsultationQualificationFields ?? '未知'}
- 资料卡缺合格线索字段：${opsCounts.pagesMissingQualifiedLeadFields ?? '未知'}
- 资料卡缺公开预览样例：${opsCounts.pagesMissingResourcePreviewSamples ?? '未知'}
- 需求卡缺六类可复制 Brief：${opsCounts.pagesMissingConsultationBriefCards ?? '未知'}
- ROI 估算器缺成本估算/复制摘要：${opsCounts.pagesMissingRoiCalculator ?? '未知'}
- 合作方式页缺预算口径：${opsCounts.pagesMissingPricingModel ?? '未知'}
- AI 获客站诊断页缺漏斗/预审/边界：${opsCounts.pagesMissingAiAcquisition ?? '未知'}
- 工作流诊断页缺诊断流程/预审卡：${opsCounts.pagesMissingWorkflowDiagnosis ?? '未知'}
- Skill/SOP 小项目页缺模块/验收/预审卡：${opsCounts.pagesMissingSkillSopProject ?? '未知'}
- 项目页缺公开运营看板：${opsCounts.pagesMissingProjectOpsBoard ?? '未知'}
- 交付流程页缺启动预审/验收边界：${opsCounts.pagesMissingDeliveryPlaybook ?? '未知'}
- 信任边界页缺脱敏材料准备/公开边界：${opsCounts.pagesMissingTrustCenter ?? '未知'}
- 上海本地页缺本地入口：${opsCounts.pagesMissingShanghaiLocalEntry ?? '未知'}
- 工作坊页缺预审/边界/流程：${opsCounts.pagesMissingWorkshop ?? '未知'}
- 服务页缺最小合作入口：${opsCounts.pagesMissingFirstDealEntry ?? '未知'}
- 服务页缺预算成交筛选：${opsCounts.pagesMissingBudgetQualification ?? '未知'}
- Coffee Chat 缺报名线索字段：${opsCounts.pagesMissingCoffeeChatSignupFields ?? '未知'}
- Coffee Chat 缺主题报名卡：${opsCounts.pagesMissingCoffeeChatTopicSignup ?? '未知'}
- Coffee Chat 缺候补排期：${opsCounts.pagesMissingCoffeeChatSessionPipeline ?? '未知'}
- Coffee Chat 缺公开复盘台账：${opsCounts.pagesMissingCoffeeChatEvidenceLedger ?? '未知'}
- Memory OS 缺公开样例/评测/隐私边界：${opsCounts.pagesMissingMemoryOs ?? '未知'}

${validation.data?.warnings?.length ? `validate:site warning：\n${bulletList(validation.data.warnings)}\n` : ''}
${health.error ? `health:content error：\n\n\`\`\`text\n${health.error}\n\`\`\`\n` : ''}
${validation.error ? `validate:site error：\n\n\`\`\`text\n${validation.error}\n\`\`\`\n` : ''}
${candidates.error ? `release:candidates error：\n\n\`\`\`text\n${candidates.error}\n\`\`\`\n` : ''}
${opsAudit.error ? `ops:audit error：\n\n\`\`\`text\n${opsAudit.error}\n\`\`\`\n` : ''}

## 4. 必须排除

以下是 Astro 运行/构建缓存，不纳入 stage：

${bulletList(runtimeExcluded)}

## 5. 商业转化质量门槛

本轮审批不只看文件数量，还要确认这些面向获客的公开变化：

- 首页保留首步分流：资料卡 / AI 自测 / 公开样例库 / ROI 估算器 / AI 获客站诊断 / Coffee Chat / 上海 AI 小型工作坊。
- 开始页保留首步分流：覆盖资料卡、AI 自测、ROI 估算、需求卡、AI 获客站诊断、合作方式、交付流程、上海 Coffee Chat、上海 AI 小型工作坊、服务方案和首步判断卡；只复制模板，不提交表单、不上传访客资料。
- 服务页保留最小合作入口：合作门槛、首次材料、本次交付、升级条件。
- 服务页保留预算口径与成交筛选：预算口径、启动条件、首次材料、本次输出、暂缓信号。
- Skills 页保留本地 Skill 资产盘点：覆盖 Word、Excel、会议纪要、来访日程、报销整理、去 AI 味写作、学术图表、学术 PPT、正式 Word、网文流水线和周报结构化，并明确不展示公司、真名、报销单据、周报原文。
- 公开样例库保留 Skill 资产盘点案例：把本地 Skill 转译成公开用途、交付物、验收口径和脱敏边界，并链接到 Skills 页；不展示本地路径、原始 Skill 全文、公司信息、真名、内部模板、报销单据和周报原文。
- 所有咨询复制模板保留合格筛选字段：来源、预算意向、期望启动时间、是否接受先诊断再项目、隐私边界。
- 需求卡页保留六类可复制 Brief：AI 工作流诊断、AI 获客站诊断、Skill/SOP 小项目、个人知识库整理、上海 AI Coffee Chat、上海 AI 小型工作坊；只复制模板，不提交表单、不上传访客资料。
- ROI 估算器保留成本预筛：覆盖每周耗时、机会成本口径、返工比例、预计 AI 可节省比例、月度节省时间、月度释放价值、复杂度选择、复制 ROI 咨询摘要、手动复制摘要兜底和本地计算隐私边界。
- 工作流诊断页保留服务化诊断入口：覆盖适合启动信号、5 步诊断流程、诊断交付物、四类诊断范围、暂缓信号、诊断预审卡、Service JSON-LD 和 FAQ。
- Skill/SOP 小项目页保留主成交入口：覆盖适合启动信号、四类模块、5 步固化流程、小项目交付物、验收矩阵、暂缓信号、预审卡、Service JSON-LD 和 FAQ。
- 项目页保留公开运营看板：覆盖最近公开更新、下次检查点、服务入口、暂缓边界，并保留 AI 小说、法考、投研、Git 记忆库、RAG、内容流水线和本站获客七条项目线。
- 合作方式页保留预算口径：覆盖 Coffee Chat / 预诊断、AI 小型工作坊、AI 获客站诊断、AI 工作流诊断、Skill/SOP 小项目、AI 系统阶段陪跑、启动条件、首次材料、本次交付、升级条件、暂缓信号和合作判断卡；公开页不写死价格。
- AI 获客站诊断页保留内容转线索入口：覆盖 6 步获客漏斗、6 个诊断问题、交付物、本地发布清单、预审卡、诊断复盘台账、Service JSON-LD、FAQ、不承诺收益、不收表单和不上传访客资料边界；复盘台账不得虚构合作案例或已举办活动。
- 交付流程页保留启动预审：覆盖需求卡收口、诊断、脱敏样例试跑、SOP/Skill 固化、本地验证、复盘迭代、验收矩阵、暂停信号和启动预审卡。
- 信任边界页保留脱敏材料准备：覆盖第一次只发脱敏材料、可以先发什么、不要直接发送什么、不提交表单、不上传不存储、公开展示边界、隐私边界卡和关键转化路径。
- 上海本地页保留本地服务入口：覆盖上海 AI 工作流诊断、知识库整理、Skill/SOP、内容商业化、Coffee Chat、上海 AI 小型工作坊、线上预沟通、交通方便公开场所和不公开私人地址边界。
- 工作坊页保留小班预审入口：覆盖 3-8 人、四类工作坊模块、6 步流程、启动条件、交付物、预审卡、Service JSON-LD、FAQ 和不公开具体地点/不虚构场次边界。
- 资料卡复制内容保留合格线索字段：微信号、资料卡备注、来源、当前场景、希望下一步、隐私边界。
- 资料卡页保留公开预览样例：至少提供 Skill 首次需求模板和知识库整理自查表的可照填公开版。
- Coffee Chat 保留完整报名线索：微信号、报名备注、来源、线索类型、报名四件套、预算意向、启动时间、是否接受先诊断再项目和隐私边界。
- Coffee Chat 保留主题报名卡：候补主题 A-D 均可复制主题报名消息，并保留来源、线索类型、预算意向、启动时间、是否接受先诊断再项目和隐私边界。
- Coffee Chat 保留下一场候补排期：覆盖候补主题、成局条件、会前材料、现场输出、公开沉淀和不公开具体地点边界。
- Coffee Chat 保留组局边界、会后复盘和转服务判断。
- Coffee Chat 保留公开复盘台账：只公开月份、主题、状态和下一步，不公开联系人、原始聊天或未确认结果。
- Memory OS 保留公开样例：只展示 AI 长期记忆库 OS 的分层架构、准入/排除/状态/隐私规则、模拟评测指标和服务交付路径，不展示真实记忆条目、私有仓库、本地路径、联系人或原始聊天。
- 所有新增转化入口仍然指向既有公开路径，不新增表单采集或第三方数据传输。

ops:audit 当前结果：

- pagesMissingCta：${opsCounts.pagesMissingCta ?? '未知'}
- pagesMissingRoute：${opsCounts.pagesMissingRoute ?? '未知'}
- pagesMissingTrust：${opsCounts.pagesMissingTrust ?? '未知'}
- pagesMissingSkillLibrary：${opsCounts.pagesMissingSkillLibrary ?? '未知'}
- pagesMissingStartRouter：${opsCounts.pagesMissingStartRouter ?? '未知'}
- pagesMissingConsultationQualificationFields：${opsCounts.pagesMissingConsultationQualificationFields ?? '未知'}
- pagesMissingConsultationBriefCards：${opsCounts.pagesMissingConsultationBriefCards ?? '未知'}
- pagesMissingRoiCalculator：${opsCounts.pagesMissingRoiCalculator ?? '未知'}
- pagesMissingPricingModel：${opsCounts.pagesMissingPricingModel ?? '未知'}
- pagesMissingAiAcquisition：${opsCounts.pagesMissingAiAcquisition ?? '未知'}
- pagesMissingWorkflowDiagnosis：${opsCounts.pagesMissingWorkflowDiagnosis ?? '未知'}
- pagesMissingSkillSopProject：${opsCounts.pagesMissingSkillSopProject ?? '未知'}
- pagesMissingProjectOpsBoard：${opsCounts.pagesMissingProjectOpsBoard ?? '未知'}
- pagesMissingDeliveryPlaybook：${opsCounts.pagesMissingDeliveryPlaybook ?? '未知'}
- pagesMissingTrustCenter：${opsCounts.pagesMissingTrustCenter ?? '未知'}
- pagesMissingShanghaiLocalEntry：${opsCounts.pagesMissingShanghaiLocalEntry ?? '未知'}
- pagesMissingWorkshop：${opsCounts.pagesMissingWorkshop ?? '未知'}
- pagesMissingQualifiedLeadFields：${opsCounts.pagesMissingQualifiedLeadFields ?? '未知'}
- pagesMissingResourcePreviewSamples：${opsCounts.pagesMissingResourcePreviewSamples ?? '未知'}
- pagesMissingFirstDealEntry：${opsCounts.pagesMissingFirstDealEntry ?? '未知'}
- pagesMissingBudgetQualification：${opsCounts.pagesMissingBudgetQualification ?? '未知'}
- pagesMissingCoffeeChatSignupFields：${opsCounts.pagesMissingCoffeeChatSignupFields ?? '未知'}
- pagesMissingCoffeeChatTopicSignup：${opsCounts.pagesMissingCoffeeChatTopicSignup ?? '未知'}
- pagesMissingCoffeeChatSessionPipeline：${opsCounts.pagesMissingCoffeeChatSessionPipeline ?? '未知'}
- pagesMissingCoffeeChatEvidenceLedger：${opsCounts.pagesMissingCoffeeChatEvidenceLedger ?? '未知'}
- pagesMissingMemoryOs：${opsCounts.pagesMissingMemoryOs ?? '未知'}

## 6. 新增未跟踪候选

${bulletList(untrackedFiles)}

## 7. 删除项摘要

非 AI 文章：

${bulletList(deletedBlogPosts)}

非 AI/生活/护肤/自拍/整活图片：

${bulletList(deletedBlogImages)}

## 8. 候选文件清单

${bulletList(truncateList(candidateFiles))}

## 9. Git 复核

\`\`\`text
${branchStatus}
\`\`\`

远端：

\`\`\`text
${remotes.join('\n')}
\`\`\`

分支：

\`\`\`text
${branches.join('\n')}
\`\`\`

## 10. 发布前审批点

公开 push 前需要老明确认：

- 允许公开删除非 AI 文章与对应图片。
- 允许公开新增/展示 AI 自测、项目页、Coffee Chat、公开样例库、产品 lead magnet 页面内容。
- 允许公开首页首步分流、AI 首步分流开始页、AI 咨询需求卡、AI ROI 估算器、AI 工作流诊断服务页、Skill/SOP 小项目页、AI 合作方式与预算口径、AI 项目交付流程、上海本地 AI 服务入口、服务页最小合作入口、服务页预算成交筛选、咨询模板合格筛选字段、资料卡合格线索话术、资料卡公开预览样例。
- 允许公开 AI ROI 估算器页面，包括每周耗时、机会成本口径、返工比例、预计 AI 可节省比例、月度节省时间、月度释放价值、复杂度选择、合作路径建议、ROI 咨询摘要复制和手动复制摘要兜底；不提交表单、不上传访客输入、不承诺收益。
- 允许公开 AI 工作流诊断服务页，包括适合启动信号、5 步诊断流程、诊断交付物、四类诊断范围、暂缓信号和诊断预审卡。
- 允许公开 AI 获客站诊断页，包括内容转线索漏斗、诊断问题、交付物、本地发布清单、预审卡、FAQ 和不承诺收益/不收表单/不上传访客资料边界。
- 允许公开 Skill/SOP 小项目页，包括适合启动信号、四类模块、5 步固化流程、小项目交付物、验收矩阵、暂缓信号和小项目预审卡。
- 允许公开项目页的公开运营看板，包括 AI 小说、法考、投研、Git 记忆库、RAG、内容流水线和本站获客七条项目线的最近公开更新、下次检查点、服务入口和暂缓边界。
- 允许公开 AI 咨询信任与隐私边界页面，包括可以先发什么、不要直接发送什么、材料处理规则、公开展示边界、脱敏材料准备卡和隐私边界确认话术。
- 允许公开 Coffee Chat 完整报名线索话术，包括来源页、线索类型、预算意向、启动时间、是否接受先诊断再项目和隐私边界。
- 允许公开 Coffee Chat 主题报名卡，包括个人 AI 工作台拆解、知识库与 RAG 诊断、内容商业化小闭环和办公自动化 Skill 设计四个候补主题。
- 允许公开 Coffee Chat 下一场候补排期，包括候补主题、成局条件、会前材料、现场输出、公开沉淀和“不公开具体地点、不虚构已举办场次”的边界。
- 允许公开 Coffee Chat 脱敏台账：2026-05 出现 AI 短剧与内容商业化方向私域预约线索，但尚未形成公开复盘；不公开联系人、原始聊天、具体地点和未确认结果。
- 允许公开 AI 长期记忆库 OS 页面，包括分层架构、准入规则、排除规则、状态规则、隐私规则、模拟评测指标、Git 版上下文仓库交付方向和咨询入口；不公开真实记忆条目、私有仓库、本地路径、联系人或原始聊天。
- 允许公开 AI 项目交付流程页面，包括 6 步交付流程、四类交付物、验收矩阵、暂停信号和启动预审卡；不公开任何原始敏感材料。
- 允许公开微信号 soplaoming 作为统一转化入口。
- 允许公开展示脱敏 Skills、项目进度、服务说明、案例卡、信任边界说明、复制咨询模板、资料领取备注关键词、旧文脱敏占位图、人工图片审计后的保留文章和品牌语气收口后的保留文章。
- 允许公开 Skills 页的本地 Skill 资产盘点公开版；不公开公司、真名、报销单据、周报原文、内部模板、后台资料或原始敏感材料。

未经确认，不执行公开 push。
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(JSON.stringify({
  ok: hardGateOk,
  outputPath,
  counts: {
    candidateFiles: candidateCounts.candidateFiles ?? null,
    modified: candidateCounts.modified ?? null,
    deleted: candidateCounts.deleted ?? null,
    untracked: candidateCounts.untracked ?? null,
    runtimeExcluded: candidateCounts.runtimeExcluded ?? null,
    redactedImages: manifest.items?.length ?? 0,
    opsAuditOutput: opsAudit.data?.outputPath ?? null,
    pagesMissingCta: opsCounts.pagesMissingCta ?? null,
    pagesMissingRoute: opsCounts.pagesMissingRoute ?? null,
    pagesMissingTrust: opsCounts.pagesMissingTrust ?? null,
    pagesMissingSkillLibrary: opsCounts.pagesMissingSkillLibrary ?? null,
    pagesMissingStartRouter: opsCounts.pagesMissingStartRouter ?? null,
    pagesMissingConsultationQualificationFields: opsCounts.pagesMissingConsultationQualificationFields ?? null,
    pagesMissingConsultationBriefCards: opsCounts.pagesMissingConsultationBriefCards ?? null,
    pagesMissingRoiCalculator: opsCounts.pagesMissingRoiCalculator ?? null,
    pagesMissingPricingModel: opsCounts.pagesMissingPricingModel ?? null,
    pagesMissingAiAcquisition: opsCounts.pagesMissingAiAcquisition ?? null,
    pagesMissingWorkflowDiagnosis: opsCounts.pagesMissingWorkflowDiagnosis ?? null,
    pagesMissingSkillSopProject: opsCounts.pagesMissingSkillSopProject ?? null,
    pagesMissingProjectOpsBoard: opsCounts.pagesMissingProjectOpsBoard ?? null,
    pagesMissingDeliveryPlaybook: opsCounts.pagesMissingDeliveryPlaybook ?? null,
    pagesMissingTrustCenter: opsCounts.pagesMissingTrustCenter ?? null,
    pagesMissingShanghaiLocalEntry: opsCounts.pagesMissingShanghaiLocalEntry ?? null,
    pagesMissingWorkshop: opsCounts.pagesMissingWorkshop ?? null,
    pagesMissingQualifiedLeadFields: opsCounts.pagesMissingQualifiedLeadFields ?? null,
    pagesMissingResourcePreviewSamples: opsCounts.pagesMissingResourcePreviewSamples ?? null,
    pagesMissingFirstDealEntry: opsCounts.pagesMissingFirstDealEntry ?? null,
    pagesMissingBudgetQualification: opsCounts.pagesMissingBudgetQualification ?? null,
    pagesMissingCoffeeChatSignupFields: opsCounts.pagesMissingCoffeeChatSignupFields ?? null,
    pagesMissingCoffeeChatTopicSignup: opsCounts.pagesMissingCoffeeChatTopicSignup ?? null,
    pagesMissingCoffeeChatSessionPipeline: opsCounts.pagesMissingCoffeeChatSessionPipeline ?? null,
    pagesMissingCoffeeChatEvidenceLedger: opsCounts.pagesMissingCoffeeChatEvidenceLedger ?? null,
    pagesMissingMemoryOs: opsCounts.pagesMissingMemoryOs ?? null,
  },
}, null, 2));

if (!hardGateOk) process.exit(1);
