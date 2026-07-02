# ailaoming.com 维护与发布 SOP

> 适用范围：ailaoming.com Astro 站点的本地维护、商业化改版、AI-only 内容边界、发布前验证与公开 push 审批。

## 1. 当前定位

ailaoming.com 是「AI干货家老明」的 AI 垂直商业获客站，不再只是文章归档站。

当前公开方向：

- AI 首步分流
- AI 工作流诊断
- AI 落地自测
- AI 获客站诊断
- AI 工作流诊断服务页
- Skill/SOP 小项目服务页
- 轻量资料领取与产品化入口
- AI 项目交付流程
- AI 咨询信任与隐私边界
- 个人知识库整理
- 办公 Skills / SOP 定制
- AI 系统落地陪跑
- 上海 AI Coffee Chat
- 上海 AI 小型工作坊
- AI 长期记忆库 OS
- AI 技术文章库

内容边界：

- 文章区只保留 AI 工具、AI 工作流、RAG、OpenClaw、Codex、Claude Code、办公 Skills、AI 写作和自动化相关内容。
- 生活、护肤、防晒、自拍、相亲、整活类内容默认不进入本站；后续如需恢复，应单独做生活区并重新审批。
- 真实客户、真实工作材料、公司内部资料、私人聊天、密钥、持仓明细不进入公开站点。
- Skills 页可以展示本地 Skill 资产的公开版，但只展示用途、交付物和脱敏边界；不得展示公司、真名、报销单据、周报原文、内部模板、后台资料或原始敏感材料。
- 旧邀请码、推荐码、过期报价、明显脏话和不适合商业站展示的情绪化截图默认不进入公开站点；保留观点时应改成中性方法论表达。

## 2. 本地工作流

常用命令：

```bash
npm run dev
npm run build
npm run health:content
npm run validate:site
npm run release:candidates
npm run release:approval
npm run ops:audit
npm run validate:wechat
```

运行时要求：

- Astro 当前要求 Node.js `>=22.12.0`，项目的 `package.json` 已声明该版本边界。
- 如果本机默认 `node` 低于该版本，构建会直接失败；在 Codex 桌面环境中可临时使用内置 Node：

```bash
PATH=/Users/danningyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build
```

推荐本地检查顺序：

1. 修改源码、内容或图片。
2. 运行 `npm run build`。
3. 运行 `npm run health:content`，检查文章元信息、主题边界、图片引用和内容更新节奏。
4. 运行 `npm run validate:site`。
5. 运行 `npm run release:candidates`，确认发布候选、删除项、远端和分支信息。
6. 运行 `npm run release:approval`，自动生成 `/private/tmp` 下的本地审批摘要。
7. 运行 `npm run ops:audit`，自动生成 `/private/tmp` 下的运营审计摘要。
8. 如涉及公众号文章同步，再运行 `npm run validate:wechat` 或指定 slug 校验。
9. 本地浏览器预览首页、开始页、服务页、AI 获客站诊断页、工作流诊断页、Skill/SOP 小项目页、合作方式页、交付流程页、信任边界页、AI 自测、需求卡、上海本地页、上海 AI 小型工作坊、Skills、项目页、Memory OS、Coffee Chat、文章列表和任一文章详情。

## 3. 发布前硬门槛

公开 push 前必须满足：

- `npm run build` 通过。
- `npm run health:content` 无 hardProblems。
- `npm run validate:site` 通过。
- `npm run validate:site` 已校验 `scripts/redacted_image_manifest.json`，33 张已登记脱敏图的 SHA-256 未变化。
- `npm run release:candidates` 输出无异常状态，并明确列出 `.astro` 缓存排除项。
- 非 AI 主题扫描无残留。
- 敏感词扫描只允许命中项目页里的公开边界声明。
- 文章图片完成抽样或全量人工视觉审计，确认无本地路径、账号、二维码、账单、订单、第三方姓名头像、私人聊天和未授权工作材料。
- 商业页不得加载文章阅读量/评论脚本。
- sitemap、RSS、robots 均已生成且无已删除非 AI slug。
- 当前分支、远端和目标部署链路已重新确认。
- 首页必须保留首步分流入口，至少覆盖资料卡、AI 自测、公开样例库和 Coffee Chat。
- 开始页必须保留首步分流入口，至少覆盖资料卡、AI 自测、ROI 估算、需求卡、AI 获客站诊断、合作方式、上海 Coffee Chat、上海 AI 小型工作坊、服务方案和首步判断卡；不得添加表单提交或第三方数据传输。
- 需求卡页必须保留六类可复制 Brief，至少覆盖 AI 工作流诊断、AI 获客站诊断、Skill/SOP 小项目、个人知识库整理、上海 AI Coffee Chat 和上海 AI 小型工作坊；不得添加表单提交或第三方数据传输。
- ROI 估算器页必须保留成本预筛入口，至少覆盖每周耗时、机会成本口径、返工比例、预计 AI 可节省比例、月度节省时间、月度释放价值、流程复杂度、合作路径建议、ROI 咨询摘要复制、手动复制摘要兜底、本地计算和“不承诺收益”边界；不得添加表单提交或第三方数据传输。
- 工作流诊断页必须保留服务化诊断入口，至少覆盖适合启动信号、5 步诊断流程、诊断交付物、四类诊断范围、暂缓信号、诊断预审卡、Service JSON-LD 和 FAQ。
- Skill/SOP 小项目页必须保留主成交入口，至少覆盖适合启动信号、四类常见模块、5 步固化流程、小项目交付物、验收矩阵、暂缓信号、小项目预审卡、Service JSON-LD 和 FAQ。
- 项目页必须保留公开运营看板，至少覆盖最近公开更新、下次检查点、服务入口、暂缓边界，并覆盖 AI 小说、法考、投研、Git 记忆库、RAG、内容流水线和本站获客七条项目线。
- 合作方式页必须保留预算口径，至少覆盖 Coffee Chat / 预诊断、AI 小型工作坊、AI 获客站诊断、AI 工作流诊断、Skill/SOP 小项目、AI 系统阶段陪跑、启动条件、首次材料、本次交付、升级条件、暂缓信号和合作判断卡；公开页不写死价格。
- AI 获客站诊断页必须保留内容转线索入口，至少覆盖 6 步获客漏斗、6 个诊断问题、交付物、本地发布清单、获客站诊断卡、诊断复盘台账、Service JSON-LD、FAQ、不承诺收益、不收表单和不上传访客资料边界；不得添加表单提交或第三方数据传输，不得虚构合作案例或已举办活动。
- 交付流程页必须保留启动预审和验收边界，至少覆盖 6 步交付流程、四类交付物、验收矩阵、暂停信号、项目启动前材料清单、启动预审卡、HowTo JSON-LD 和 FAQ。
- 信任边界页必须保留脱敏材料准备和公开展示边界，至少覆盖第一次只发脱敏材料、可以先发什么、不要直接发送什么、不提交表单、不上传不存储、材料处理规则、隐私边界卡、WebPage JSON-LD 和 FAQ。
- 上海本地页必须保留本地服务入口，至少覆盖上海 AI 工作流诊断、知识库整理、Skill/SOP、内容商业化、Coffee Chat、上海 AI 小型工作坊、线上预沟通、交通方便公开场所和不公开私人地址边界。
- 工作坊页必须保留小班预审入口，至少覆盖 3-8 人、四类工作坊模块、6 步流程、启动条件、交付物、工作坊预审卡、Service JSON-LD、FAQ、不公开具体地点和不虚构已举办场次边界；不得添加表单提交或第三方数据传输。
- 服务页必须保留最小合作入口，至少覆盖合作门槛、首次材料、本次交付和升级条件。
- 服务页必须保留预算口径与成交筛选，至少覆盖预算口径、启动条件、首次材料、本次输出和暂缓信号。
- 咨询模板复制内容必须保留合格筛选字段，至少覆盖来源、预算意向、期望启动时间、是否接受先诊断再项目和隐私边界。
- 资料卡复制内容必须保留合格线索字段，至少覆盖微信号、资料卡备注、来源、当前场景、希望下一步和隐私边界。
- 资料卡页必须保留公开预览样例，至少覆盖 Skill 首次需求模板和知识库整理自查表的可照填公开版。
- Coffee Chat 复制报名话术必须保留完整报名线索字段，至少覆盖微信号、报名备注、来源、线索类型、报名四件套、预算意向、期望启动时间、是否接受先诊断再项目和隐私边界。
- Coffee Chat 主题报名卡必须保留候补主题 A-D 的可复制报名消息，至少覆盖主题来源、线索类型、预算意向、期望启动时间、是否接受先诊断再项目和隐私边界；不得添加表单提交或第三方数据传输。
- Coffee Chat 下一场候补排期必须保留，至少覆盖候补主题、成局条件、会前材料、现场输出、公开沉淀和不公开具体地点边界；不得虚构已举办场次。
- Coffee Chat 页面必须保留公开复盘台账，至少覆盖私域线索状态、公开复盘数量、脱敏原则和“不把预约线索包装成活动战报”的声明。
- Memory OS 页面必须保留长期记忆库公开样例，至少覆盖分层架构、准入规则、排除规则、状态规则、隐私规则、模拟评测指标、可交付方向、咨询入口和“不展示真实记忆条目、私有仓库、本地路径、联系人、原始聊天”的边界。
- Skills 页必须保留本地 Skill 资产盘点，至少覆盖 Word、Excel、会议纪要、来访日程、报销整理、去 AI 味写作、学术图表、学术 PPT、正式 Word、网文流水线和周报结构化，并明确脱敏边界。
- 公开样例库必须保留本地 Skill 资产盘点案例，至少覆盖公开用途、交付物、验收口径、脱敏边界、Skills 页入口和“不公开本地路径、原始 Skill 全文、公司信息、真名、内部模板、后台数据、报销单据、周报原文”的边界。
- `npm run ops:audit` 中 `pagesMissingStartRouter`、`pagesMissingSkillLibrary`、`pagesMissingConsultationQualificationFields`、`pagesMissingConsultationBriefCards`、`pagesMissingRoiCalculator`、`pagesMissingPricingModel`、`pagesMissingAiAcquisition`、`pagesMissingWorkflowDiagnosis`、`pagesMissingSkillSopProject`、`pagesMissingProjectOpsBoard`、`pagesMissingDeliveryPlaybook`、`pagesMissingTrustCenter`、`pagesMissingShanghaiLocalEntry`、`pagesMissingWorkshop`、`pagesMissingQualifiedLeadFields`、`pagesMissingResourcePreviewSamples`、`pagesMissingFirstDealEntry`、`pagesMissingBudgetQualification`、`pagesMissingCoffeeChatSignupFields`、`pagesMissingCoffeeChatTopicSignup`、`pagesMissingCoffeeChatSessionPipeline`、`pagesMissingCoffeeChatEvidenceLedger` 和 `pagesMissingMemoryOs` 必须为 0。

## 4. Git 边界

本仓库存在历史远端差异，发布前必须用以下命令复核：

```bash
git status --short --branch
git remote -v
git branch -vv
```

注意：

- 不要仅凭旧 SOP 假设 `master -> origin -> Vercel` 一定仍是当前发布链路。
- 当前长期改版分支可能不是 `master`。
- `.astro/data-store.json` 和 `.astro/settings.json` 是 Astro 构建/预览产生的运行时缓存差异，发布提交时默认排除。
- 新增页面、组件、脚本和 `public/robots.txt` 这类未跟踪文件必须显式纳入发布候选。

## 5. 审批规则

本地修改可以先做，公开 push 前必须向老明确认。

需要审批的内容：

- 新增或删除公开文章。
- 新增项目页、服务页、AI 自测页、Coffee Chat 页等会改变公开内容的信息。
- 公开微信号、服务描述、项目进度、商业承接方式。
- 删除大量旧内容或图片。

不需要单独审批但仍需验证的内容：

- 纯视觉排版优化。
- SEO 元信息、Open Graph、结构化数据、robots、RSS、sitemap。
- 发布前验证脚本和维护文档。

## 6. 发布候选整理

建议发版前生成或更新审批清单，至少包括：

- 当前分支和远端。
- 发布候选文件统计。
- 明确排除项。
- 构建和验证命令结果。
- 删除文章与图片列表。
- 新增公开页面和组件列表。
- 商业转化质量门槛：首页首步分流、开始页首步分流、ROI 估算器、AI 获客站诊断页、工作流诊断页、Skill/SOP 小项目页、项目公开运营看板、合作方式页、交付流程页、信任边界页、上海本地入口、最小合作入口、预算成交筛选、咨询模板合格筛选字段、合格线索字段、资料卡公开预览样例、Memory OS 公开样例、Coffee Chat 完整报名线索、Coffee Chat 主题报名卡、Coffee Chat 下一场候补排期、Coffee Chat 公开复盘台账、Coffee Chat 报名路径。
- 需要老明确认的公开信息点。

当前临时审批清单位置：

```text
/private/tmp/ailaoming_publish_approval_2026-07-01.md
```

可用以下命令生成当天自动审批摘要：

```bash
npm run release:approval
```

可用以下命令生成当天运营审计摘要：

```bash
npm run ops:audit
```

## 7. 验收口径

商业化改版不是只看页面是否能打开，而要同时满足：

- 定位清楚：首屏能看懂是 AI 系统落地服务。
- 转化清楚：用户能找到微信、AI 自测、轻量资料领取和 Coffee Chat 入口。
- 分流清楚：用户能按“先自学 / 有重复流程 / 内容不转化 / 看可信度 / 上海当面拆 / 同题工作坊”选择第一步。
- 开始清楚：开始页能把第一次访问者分到资料卡、AI 自测、ROI 估算、需求卡、AI 获客站诊断、合作方式、上海 Coffee Chat、上海 AI 小型工作坊或服务方案，并提供可复制首步判断卡。
- 需求清楚：需求卡能把“工作流诊断 / AI 获客站诊断 / Skill-SOP / 知识库整理 / Coffee Chat / 工作坊”六类意图压缩成可复制、可跟进、可筛选的消息。
- 获客清楚：AI 获客站诊断页必须说明内容入口、证据资产、自助判断、低摩擦联系、交流承接、服务交付六步如何把公开内容转成合格线索，并保留预审卡、预算筛选、诊断复盘台账、隐私边界和不承诺收益边界；复盘台账只能写本站自诊断、脱敏共性问题和可公开动作。
- ROI 清楚：ROI 估算器能用每周耗时、机会成本、返工比例、预计节省比例和流程复杂度，估算月度节省时间与释放价值，并引导到资料卡、Coffee Chat、工作流诊断或 Skill/SOP 小项目；必须本地计算，不提交访客输入，不承诺收益，并保留手动复制摘要兜底。
- 诊断清楚：工作流诊断页必须说明适合启动信号、诊断流程、输出物、诊断范围、暂缓信号和诊断预审卡，把自测流量承接到服务化入口。
- 小项目清楚：Skill/SOP 小项目页必须说明适合启动信号、常见模块、固化流程、交付物、验收矩阵、暂缓信号和小项目预审卡，把高分诊断流量承接到可复跑交付。
- 项目运营清楚：项目页必须说明七条 AI 项目线的最近公开更新、下次检查点、服务入口和暂缓边界，避免项目进度停留在静态自我展示。
- 合作清楚：合作方式页必须说明五档合作模型、预算口径、启动条件、首次材料、本次交付、升级条件和暂缓信号；公开页不写死价格，不承诺接所有需求。
- 交付清楚：交付流程页必须说明从需求卡到可复跑闭环的步骤、每步输出、通过标准、交付类型、验收矩阵和暂停信号。
- 信任清楚：信任边界页必须说明可以先发什么、不要直接发送什么、材料处理规则、公开展示边界、脱敏材料准备卡和关键转化路径。
- 本地清楚：上海本地页必须说明服务范围、线上/线下分流、交通方便公开场所、不可公开边界和本地需求卡，不承诺上门服务，不暴露私人地址。
- 工作坊清楚：工作坊页必须说明 3-8 人、小班预审、四类模块、6 步流程、启动条件、交付物和隐私边界，不公开具体地点，不虚构已举办场次。
- 线索清楚：资料卡和咨询模板能复制出可跟进的消息，包含来源、预算意向、启动时间、是否接受先诊断再项目和隐私边界，而不是只留下模糊的“想了解一下”。
- 预览清楚：资料卡页先展示可照填公开样例，再引导领取完整版或进入诊断，不能只展示候补状态。
- 成交清楚：服务页能说明预算形态、启动条件、首次材料、可交付输出和暂缓信号，减少低质量咨询。
- 线下清楚：Coffee Chat 报名消息能说明来源、主题、区域、具体流程、希望输出、预算意向、启动时间、是否接受先诊断再项目和隐私边界。
- 主题清楚：Coffee Chat 候补主题能直接复制报名卡，避免只留下“想了解一下”的低质量线索。
- 排期清楚：Coffee Chat 必须说明候补主题、成局条件、会前材料、现场输出和公开沉淀，不写具体地点，不虚构已举办场次。
- 复盘清楚：Coffee Chat 只能公开月份、主题、共性问题、可公开结论和下一步；预约线索不能包装成已举办活动，私人聊天不能包装成案例背书。
- 记忆清楚：Memory OS 只能公开架构、规则、指标和服务路径，不展示真实记忆条目、私有仓库、本地路径、联系人或原始聊天。
- 证据清楚：Skills、项目、公开文章能证明能力。
- 案例清楚：公开样例库必须把 Skills 本地资产盘点作为可核验样例，说明从内部 Skill 到公开服务入口的转译方式和脱敏边界。
- 边界清楚：不泄露真实客户、公司、内部资料和私人信息。
- 边界清楚：首页、服务页、AI 获客站诊断页、AI 自测、交付流程页、信任边界页、Coffee Chat 和工作坊必须保留交付边界说明，至少覆盖脱敏样例、小闭环、验收口径和高风险需求拒绝。
- 技术清楚：构建、RSS、sitemap、robots、OG、JSON-LD、图片引用都可验证。
- Skill 清楚：Skills 页必须把本地 Skill 资产转译成公开可理解的能力矩阵，每项说明公开用途、可交付物和脱敏边界，尤其报销、周报、会议、接待类内容不得展示内部原文。

## 8. 月度内容体检

建议每月运行一次：

```bash
npm run health:content
npm run ops:audit
```

关注输出中的：

- `hardProblems`：必须修复，包括缺 frontmatter、日期无效、缺图、非 AI 主题词、敏感词。
- `brand-risk terms`：必须修复，包括旧推广链接、旧低价资料包、明显脏话、过期报价和商业站不适合展示的情绪化表达。
- `softWarnings`：建议复核，包括描述过短、缺关键词、来源标记弱、最新文章过久未更新。
- `latestPosts`：用于判断近期内容节奏和主题是否仍然围绕 AI。
- `ops:audit` 输出的商业页面转化覆盖：用于检查微信、复制咨询模板、复制微信号、AI 自测、Coffee Chat、信任边界、Skills 本地资产盘点、开始页首步分流、咨询模板合格筛选字段、ROI 估算器、AI 获客站诊断页、工作流诊断页、Skill/SOP 小项目页、项目公开运营看板、合作方式页、交付流程页、信任边界页、上海本地入口、工作坊预审入口、合格线索字段、资料卡公开预览样例、Memory OS 公开样例、最小合作入口、预算成交筛选、Coffee Chat 报名线索、主题报名卡、下一场候补排期和公开复盘台账是否仍然完整。

脚本之外必须补一轮人工图片审计：

- 看正文截图里是否出现本地文件路径、设备名、账号、二维码、付款/订单/账单、真实姓名头像、微信聊天、朋友圈或公司/客户材料。
- 有风险但文章方法论值得保留时，优先使用同尺寸公开安全占位图覆盖原图，保持文章结构和引用稳定。
- 覆盖或新增脱敏图后，必须更新 `scripts/redacted_image_manifest.json` 的路径、原因和 SHA-256；未经人工复核，不要只改哈希。
- 覆盖后再跑 `npm run build`、`npm run health:content`、`npm run validate:site` 和 `npm run release:candidates`。
