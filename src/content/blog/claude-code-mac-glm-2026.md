---
title: "2026 了，把 Claude Code 真正用起来 | Mac 专版 + 智谱 GLM（配图已附）"
description: 终端、Git、Node、Claude Code 原生安装、智谱 GLM 三道环境变量与 Coding Helper；MCP / Skills 进阶。
pubDate: 2026-04-10
keywords: ["Claude Code", "智谱", "GLM", "Mac", "终端", "Git", "Node", "教程"]
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/P3St1vufT6Yw2IZamxq2jg)

老明按：

这是 **只写给 macOS** 的一篇，写法上会 **稍微啰嗦一点**：不全是为凑字数，而是把「这一步到底在干什么、不装会怎样、和前后几步什么关系」说清楚。你要是熟手，目录跳着看就行；要是第一次碰终端，跟着走不容易心里发虚。

落地目标就四件事：**会开终端** → **依赖齐活（Git、Node）** → **Claude Code 装好** → **接上智谱 GLM**（账单与 Key 在国内平台，不必绑 Claude 官网那一套订阅）。

智谱侧以 [Claude API 兼容](https://docs.bigmodel.cn/cn/guide/develop/claude/introduction) 与 [Coding Plan 快速开始](https://docs.bigmodel.cn/cn/coding-plan/quick-start) 为准；CC 本体以 [Advanced setup](https://docs.anthropic.com/en/docs/claude-code/setup) 为准。

---

## 1）Mac 前置：终端、Git、Node——每一步都在为谁服务？

**这一整节解决什么问题？**  
Claude Code 长在「终端 + 你的项目文件夹」里。它要经常读代码、改文件、跑命令，很多时候还要和 **Git 仓库**打交道；后面接智谱、跑 `npx` 小工具又离不开 **Node 生态**。所以顺序是：**先会开终端** → **确认 Git 可用** → **装上 Node（含 npm）**。少哪一样，后面都可能卡在奇怪 English 报错里，你也不知道该怪谁。

---

### 1.1 打开「终端」——CC 的「驾驶室」在哪？

终端就是一个让你打字、计算机照做的窗口。Claude Code **不是**只在网页里点点就能用全的玩具，它默认要跟你的本机文件系统、Shell 打交道，所以 **终端必须熟练打开**，以后每次进项目干活几乎都会用到。

怎么开、怎么在 Finder 里找到「终端」应用，看图即可：

![打开终端提示](/images/claude-code-mac/img-01-open-terminal.png)

再开一个窗口，做两件小事，意义分别是：

- **`pwd`**：打印**当前工作目录**。后面 CC 读写文件、给权限范围，都和你「站在哪个文件夹里」强相关；不知道自己在哪，很容易让 agent 改错目录。  
- **`git --version`**：确认 **Git 已装进系统**，并且有版本号输出（具体 2.x 不重要，有就行）。

![pwd 与 git 版本](/images/claude-code-mac/img-02-pwd-git-version.png)

---

### 1.2 Git：不是「只有程序员才要」，CC 也吃它

**Git 是干什么的？**  
它是现代项目里管理软件版本、分支、改动的标准工具。Claude Code 在真实工程里经常要：

- 读 `git diff`、看改动了哪些行；  
- 按仓库结构理解项目；  
- 有些工作流会直接触达 Git 命令。

官方在 Windows 上把 **Git** 写进硬性前置条件；在 Mac 上很多人 **Xcode 命令行工具里自带了一份 Git**，也有人整机从没装过——**不装不一定立刻崩，但会在各种智能化操作上「缺胳膊少腿」或报一堆找不到 git 的错误**。这篇稿建议你把它当成 **和 Node 一样的基础设施**：一次性装好，后面省心。

**怎么装？**  
最省事的路子往往是：**有 Homebrew 的，用一条 `brew install git`**（下一小节会解释 Homebrew 是啥）。  
如果你暂时不想动 Homebrew，也可以用 **官网说明页**里列的别的方式，例如 **MacPorts**、或只装 **Xcode Command Line Tools**（`xcode-select --install`，会顺带提供 Apple 自带的 Git）。下图是官网 macOS 安装指引截屏，你可以对照选一条自己最顺口的路：

![Git 官网 · macOS 安装说明](/images/claude-code-mac/web-git-macos.png)

若你已装 Homebrew，常见就是：

```bash
brew install git
```

装完再执行 `git --version`，能看到版本号就过关（可与上一张 `pwd` 图合并理解为一组「体检动作」）。

---

### 1.3 Homebrew：Mac 上装开发工具的「大应用商店」（顺便解释它和 Git 的关系）

**Homebrew 是什么？**  
可以理解成：在终端里一句话就能装很多开发软件（Git、Node、各种 CLI 工具、甚至图形软件的 cask）。它不是苹果官方自带的，但是 **Mac 上程序员最主流** 的安装方式之一。

**和本篇有什么关系？**

- 上文 **`brew install git`** 依赖 Homebrew；  
- 下文装 Claude Code 的 **Cask 路线**（`brew install --cask claude-code`）也依赖它；  
- 很多人装 Node 也会 `brew install node`，省事。

**如果你机器上还没有 Homebrew**：先到 [brew.sh](https://brew.sh) 按官方一条命令装好（装一次管很久）。**如果你打死不用 Homebrew**：Git 可走官网 / Xcode CLI；Node 可走 [nodejs.org](https://nodejs.org/) 安装包；Claude Code 可走官方的 **`curl … install.sh`**——也就是本篇后面的「原生安装」，不依赖 brew。

这样写清楚，读者不会误以为「没有 brew 就不能往下走」。

---

### 1.4 Node.js：给 npm / npx「托底」，智谱向导和 Skills 都要它

**Node 是干什么的？**  
它是一个 JavaScript 运行时。对你而言，**更直接的价值**是：它自带 **npm**，让你能跑：

- `npm install -g …`（全局装 CLI）；  
- **`npx …`（临时拉一个包跑一下就走）**——后面智谱的 **Coding Tool Helper**、Anthropic 侧的 **skills-installer** 之类，经常就是 `npx` 一把梭。

**是不是「只装 Claude Code 本体」就一定需要 Node？**  
不一定。官方 **原生 `curl` 安装** 不强制你先装 Node。但只要你打算：

- 走智谱 **一键配置向导**；  
- 或装 **Skills**、跑各种前端/脚手架小工具；

**没有 Node 会频繁碰壁**。所以这篇稿把 Node 放在前置里，属于：**一次配齐，后面少返工**。

怎么装看个人习惯：官网安装包、Homebrew、`nvm` 都行。下图是 Node 官网下载区，可按 **LTS** 来：

![Node.js 官网下载区](/images/claude-code-mac/web-nodejs-download.png)

装好后在终端确认：

![node 与 npm 版本](/images/claude-code-mac/img-03-node-npm.png)

---

## 2）安装 Claude Code（CC）：三种路子各适合谁？

Claude Code 是 Anthropic 出的**终端里跑的 Agent**。安装前先看一眼 **系统要求**（例如 macOS 13+、内存等），免得老机器装上了跑不动：

![Claude Code 官方 Advanced setup 节选](/images/claude-code-mac/web-anthropic-cc-setup.png)

### 2.1 推荐：原生一条命令（官方主推，不依赖 npm）

![原生安装命令](/images/claude-code-mac/img-04-install-cmd-native.png)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**这步在干什么？**  
用官方脚本拉取并安装 **原生二进制**，后续还能走自动更新通道。相对旧的「全局 npm 一把装」，这是官方现在更推荐的路径。**装完建议你关掉终端再开一个新的**，让 PATH 生效，再去做 `claude --version`。

### 2.2 可选：Homebrew Cask（你喜欢 brew 全家桶时用）

![brew install cask](/images/claude-code-mac/img-05-brew-cask-alt.png)

```bash
brew install --cask claude-code
```

**适合谁？**  
机器上已经重度使用 Homebrew、希望用 `brew upgrade` 统一升级的人。**注意**：官方文档写过，brew 装的版本**不一定**和原生脚本一样自动更新策略，自己要偶尔记得升级。

### 2.3 备选：npm 全局安装（Legacy，仅兼容老习惯）

![npm 全局安装（Deprecated）](/images/claude-code-mac/img-15-npm-legacy.png)

```bash
npm install -g @anthropic-ai/claude-code
```

**为什么还提一句？**  
因为老教程全在写这条。官方已标记 **Deprecated**，新读者 **优先 curl 原生**；只有历史项目、脚本迁移才值得留恋这条。

---

## 3）验证装没装好：先别急着接模型

命令一律小写：`claude`。

![claude --version](/images/claude-code-mac/img-06-claude-version.png)

- **`claude --version`**：确认二进制已进 PATH，版本号能打印出来。

![claude doctor 说明](/images/claude-code-mac/img-07-claude-doctor.png)

- **`claude doctor`**：官方体检，会唠叨配置、更新器、部分环境项。**若此时还没接智谱**，有些与模型连接的项可能黄灯或报错——**不必慌**，接完第 4 节再对照一次更有意义。  
- 若 `doctor` 在你机器上特别慢，先 Activity Monitor 里结束再试，以本机实际输出为准。

---

## 4）主线：接智谱 GLM——本质是「改三道门牌，让 CC 以为自己在跟 Anthropic 说话」

**为什么要这么绕？**  
Claude Code 生下来就熟悉 **Anthropic 的 API 形态**。智谱提供 **Claude 兼容网关**，于是你只要把 **Base URL、Key、模型名** 三个环境变量指到智谱，**工具还是 CC，大脑换成 GLM**，账单也在国内控制台——适合不想折腾境外 Claude 账号、订阅和风控焦虑的用法。

### 4.1 文档依据（建议读者至少扫一眼截图里的官方表述）

![智谱 · Claude API 兼容文档](/images/claude-code-mac/web-bigmodel-claude-api.png)

![智谱 · GLM Coding Plan 快速开始](/images/claude-code-mac/web-bigmodel-coding-plan-quickstart.png)

**Coding Plan** 往往和「在编码工具里大胆用 GLM」绑定；具体套餐、额度、价格以页面为准，别死记我文里某个数字。

### 4.2 在网页上创建 API Key

访问 [智谱开放平台](https://open.bigmodel.cn/) → 登录 → **API Keys** 创建并复制。  
**用途**：它就是下文 `ANTHROPIC_AUTH_TOKEN`，相当于「房间钥匙」，别发群里、别塞进 Git。

### 4.3 终端里先 `export` 试一把（确认能通再写进配置文件）

![export 智谱三变量（示例）](/images/claude-code-mac/img-08-export-zhipu.png)

```bash
# 1. 设置API基础URL（智谱的Anthropic兼容端点）
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
# 2. 设置你的智谱API密钥（将your_api_key替换为实际密钥）
export ANTHROPIC_AUTH_TOKEN=xxx
# 3. 设置要使用的模型（智谱GLM-4.7）
export ANTHROPIC_MODEL=GLM-4.7
```

三道变量分别干什么：

| 变量                     | 干什么                                                                   |
| ---------------------- | --------------------------------------------------------------------- |
| `ANTHROPIC_BASE_URL`   | 告诉 CC：**去哪家服务器**找兼容接口；智谱典型是 `https://open.bigmodel.cn/api/anthropic`。 |
| `ANTHROPIC_AUTH_TOKEN` | 你的 **API Key**，认证用。                                                   |
| `ANTHROPIC_MODEL`      | 用哪个 **模型 id**；示例 `glm-4.7`，**以智谱控制台/文档最新为准**，以后改名就跟文档改名。              |

### 4.4 写进 `~/.zshrc`：省得每次开终端都手动 export

![zshrc 提示](/images/claude-code-mac/img-16-zshrc-tip.png)

macOS 默认登录 shell 多是 **zsh**，把三行 `export` 放进 `~/.zshrc`，以后每个新终端都会带上。改完 **`source ~/.zshrc`** 让当前窗口也吃到。

### 4.5 若仍弹出 Claude 官网登录

先试：**新开终端** → 进项目目录 → `claude`；或在 CC 内 `/logout`（若有）。仍不行以**当时**智谱故障排除为准。

### 4.6 备选：Anthropic 官网订阅

本稿教学主线是智谱；若你走官方 Pro/Max，自行看 [Authentication](https://docs.anthropic.com/en/authentication)。

---

## 5）推荐：智谱 Coding Tool Helper——手输三行总怕抄漏的人用它

**它在干什么？**  
相当于一个 **中文分步向导**：选语言、套餐、粘贴 Key、勾选目标工具是 Claude Code，帮你把环境理顺。对「怕少写一个引号」的同学友好。

![npx coding-helper](/images/claude-code-mac/img-09-npx-helper.png)

```bash
npx @z_ai/coding-helper
```

**和手动 `export` 什么关系？**  
目标一样，**手段不同**；最终以向导界面和当前文档里的包名为准。你已手动配好且跑通了，也可以跳过本节。

---

## 6）在正确文件夹里启动 CC：上下文和权限都从「你在哪」开始

**为什么要强调目录？**  
CC 默认把你当前目录当成「主工作区」。站在桌面根目录开 cc，和你站在 `~/project/我的网站` 里开，**它能读、能改的范围不一样**。新手最稳的习惯：**一项目一文件夹**，先进再开。

![cd 与 claude](/images/claude-code-mac/img-10-cd-claude.png)

示例：

```bash
mkdir -p ~/Desktop/cc-demo
cd ~/Desktop/cc-demo
claude
```

演示用 `cc-demo`，你真干活就换成真实项目路径。

---

## 7）斜杠命令 `/`：CC 内置的「快捷菜单」

进入交互界面后，斜杠开头的是内置子命令（版本迭代会变，以 `/help` 为准）。常见用途一句话：

- **`/`**：拉出可输入的子命令列表；  
- **`/help`**：说明；  
- **`/status`**：当前模型、连接、账户类摘要；  
- **`/clear`**：清会话，开个新任务前常用；  
- **`/mcp`**：管理 MCP 外挂；  
- **`/doctor`**：再跑环境体检。

![斜杠命令示意](/images/claude-code-mac/img-11-slash-help.png)

---

## 8）几条实用提醒（踩过坑的人才懂）

- **一任务一文件夹**：减少误删、误改，也让你在回顾时知道「那次对话服务哪个项目」。  
- **粘贴与全选**：终端/CC 里 **⌘A / Ctrl+A** 往往不像备忘录那样「整段清空」；多习惯 **逐段删、或 rely on /clear**。粘贴 **⌘V** 或右键，视你终端模拟器而定。  
- **危险模式**：只有在你**限定目录、数据有备份**、知道自己要全自动时才开：

![危险模式命令](/images/claude-code-mac/img-12-danger-mode.png)

**语义**：少确认、快交付，也更容易一口气把事情办砸——**默认带确认才是保护你**。  

---

## 9）小案例

在 `cc-demo` 里故意放几个乱起名文件，然后对 CC 说中文需求，例如「把本文件夹里文件名改成规范英文，**只改名字、不动编号**」。这类 **重复性体力活** 正适合验收 Agent 是否真的进入你的工作流；

---

## 10）MCP（进阶）：给 CC 加长手脚

MCP 可以理解为**标准接口**，接浏览器 DevTools、数据库、私有文档库等。示例命令：

![claude mcp add 示例](/images/claude-code-mac/img-13-mcp-add-example.png)

进 CC 后 **`/mcp`** 看有没有挂载成功；具体包名、仓库以官方 README 为准。

---

## 11）Skills（进阶）：别人封装好的「技能包」

![skills-installer 示例](/images/claude-code-mac/img-14-skills-install.png)

**干什么用？**  
把常见工作流打成可复用能力，减少每次都写超长提示词。与第三方 GLM 的组合是否 100% 齐套，以**当时**版本策略为准，别硬杠「必须怎样」。

---

## 写在最后

把路铺完整：**终端**是驾驶室，**Git / Node** 是油路，**Claude Code** 是车体，**智谱 GLM** 换成你能稳定加油的那款引擎。工具会改版，条款会更名；真正可靠的是：**你脑子里有「为什么要有这一步」**，出事知道该回头查官方文档哪一页。
