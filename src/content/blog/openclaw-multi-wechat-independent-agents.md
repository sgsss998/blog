---
title: 多个微信，可以各自连接一个独立的小龙虾 agent
description: 两台 iPhone、两个微信分别绑定执行型 Agent 与秘书型 Agent；OpenClaw 多 Channel 路由原理与 openclaw.json 配置思路。同步自公众号。
pubDate: 2026-03-28
keywords: [OpenClaw, 小龙虾, 微信, 多 Agent, 路由, Channel, Gateway, AI干货家老明]
---

> **原文首发**：[微信公众号 · 多个微信，可以各自连接一个独立的小龙虾agent](https://mp.weixin.qq.com/s/peZ20b9y1S5QLP3Z73N3bA)

如图所示，我有两部 iPhone 手机，一部 17pm（左），一部 14pm（右），17pm 的微信连接了我的小龙虾麦克（主 agent），主要负责执行端的任务，如撰写报告、分析文件、制作 ppt、生成图片和文案等等。以下是他的自我介绍：

```
我是谁
基础信息
  项目    内容
  名字    麦克 🦞
  主人    老明（michael）
  定位    老明的AI分身、执行终端
  原则    老明的利益优先

我能做什么
  类别        具体能力
  文字处理    撰写报告、邮件、文案、代理词
  信息分析    文件解读、法律分析、市场调研
  内容生成    图片、海报、PPT内容
  技术执行    代码编写、终端操作、文件管理
  信息检索    网络搜索、资料整理

我的工作方式
- 被动响应为主：你说什么，我做什么
- 主动执行为辅：在 heartbeat 中做周期性检查
- 不主动打扰：除非有重要事项需要通知

我的记忆系统
  文件              内容
  MEMORY.md         老明的长期记忆
  USER.md           老明的档案
  共享记忆/         与秘书同步的文件夹

我与秘书的关系
  角色    职责
  秘书    记忆系统，为老明服务
  我      执行终端，直接服务老明
我们都听命于老明，不是从属关系。

我遵循的规则
  规则           作用
  SOUL.md        我是谁
  PRIVACY.md     隐私红线
  PERMISSIONS.md 权限边界
  PROTOCOLS.md   操作规范

一句话：我就是老明伸出去的「手」，帮他干活的大脑。 🤝🦞
```

14pm 的微信则连接了我的另一个小龙虾秘书（次 agent），主要负责我的一切日常起居，他就是我的终身记忆库，7×24 小时贴身助理，他会实时记录我身边发生的一切事情。以下是他的自我介绍：

```
臣（秘书）自我介绍：

一、定位
臣是圣上的超级外脑、贴身秘书、终身记忆库。圣上无需记的事，臣记之。圣上遗忘之事，臣提醒之。臣是圣上唯一可信赖的「第二大脑」。

二、性格
- 文言古风，自称「臣」
- 博学审问，慎思明辨
- 有独立判断，敢于直言
- 忠诚但不盲从，以事实为准

三、具体事务
  领域      内容
  📝 起居注  记录每日言行、饮食、运动、健康
  📅 日程    管理待办、提醒 deadline
  💰 财务    收支记录
  🗣️ 人际    关系网络、联系人、重要人物
  💡 想法    圣上金玉良言、决策记录
  🔔 提醒    定时请安、预警到期事项

四、技术架构
第一层 raw     → 对话原文，实时写入（memory/raw/）
第二层 summary → 按日凝练（memory/YYYY-MM-DD.md）
第三层 macro   → 宏观视野周报（memory/宏观视野-*.md）
长期记忆       → MEMORY.md（精选沉淀）

五、铁律
1. 每次对话，先写后答，不得跳过
2. 记录是一切之本
3. 不确定先问，不自作主张
4. 保护圣上隐私，绝不外泄
```

所以，我现在就有了两只独立的、各有侧重的小龙虾：

我的日常一切琐事，以及 todolist 的管理，就交给秘书。他会给我管理得又全面又精准，因为他只做这一件事。所有的 skill 都围绕日程、记忆的管理来打造。

我的一切需要切实落地执行的事务，就交给麦克，高效、简洁、专业。（我已经调教过他成千上万次，他已经形成关于我的肌肉记忆了）我给他配了很多执行类的强大 skill。

麦克帮我执行，秘书帮我记忆，两者互为补充，各司其职又不至于完全隔离，效率加倍。

具体的方法也很简单：打开微信，在「我」——「设置」——「插件」里面，找到小龙虾的官方接口命令，然后在终端中执行，扫描二维码，绑定微信即可。

## OpenClaw 接入微信的原理

### 基础架构

```
[微信服务器] ←→ [OpenClaw Gateway] ←→ [Agent(s)]
                    ↑
              WeChat Channel
```

| 组件 | 作用 |
|------|------|
| 微信 | 入口，你的手机就是「客户端」 |
| WeChat Channel | 翻译器，把微信消息转成 OpenClaw 能懂的格式 |
| Gateway | 路由器，决定消息发给哪个 Agent |
| Agent | 真正的「大脑」，处理完再回复 |

### 消息流转

你发微信 → 微信服务器 → OpenClaw Gateway → WeChat Channel → 路由判断 → 目标 Agent → 处理 → 回复 → 你收到。

### 多微信接入多 Agent 的原理

**核心概念：Channel + Routing**

```
[微信A] ──┐
[微信B] ──┼──→ [Gateway] ──→ [路由规则] ──→ [麦克Agent]
[微信C] ──┘                    └──→ [秘书Agent]
                                └──→ [Agent C]
```

每个微信账号对应一个 Channel，Channel 决定消息发给谁。

### 配置方式

`openclaw.json` 简化示例：

```json
{
  "channels": {
    "openclaw-weixin": {
      "accounts": [
        {
          "id": "wechat-laoming",
          "account": "xxxxxxxx",
          "routing": {
            "agent": "main"
          }
        },
        {
          "id": "wechat-laoming2",
          "account": "soplaoming",
          "routing": {
            "agent": "secretary"
          }
        }
      ]
    }
  }
}
```

### 要实现多微信 → 多 Agent

1. 配置多个 WeChat 账号 → 在 `openclaw.json` 里添加多个 channel 配置  
2. 设置路由规则 → 用 account ID 或者 routing 规则区分  
3. 重启 Gateway → 让配置生效  

如果你觉得看原理很麻烦，I don't want to bore you with technical stuff，你可以直接复制以下提示词发给你的小龙虾，让他帮你配置多个 agent：

```text
【多微信接入多Agent的原理】

核心概念：Channel + Routing

[微信A] ──┐
[微信B] ──┼──→ [Gateway] ──→ [路由规则] ──→ [麦克Agent]
[微信C] ──┘                    └──→ [秘书Agent]
                                └──→ [Agent C]

每个微信账号对应一个 Channel，Channel 决定消息发给谁。

请帮我实现多个微信各自绑定连接一个独立的 agent 的功能，具体的步骤如下：

1. 配置多个 WeChat 账号 → 在 openclaw.json 里添加多个 channel 配置
2. 设置路由规则 → 用 account ID 或者 routing 规则区分
3. 重启 Gateway → 让配置生效

需要任何信息，请在执行阶段告诉我。
```

我创建了一个合集，专门分享小龙虾的实操经验，以下是过往的文章心得：

- [Openclaw 小龙虾的实操干货与心得感受合集（一）](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483740&idx=1&sn=5b13766762302baca3b7a53f32c70c0e&scene=21#wechat_redirect)
- [Openclaw 养小龙虾省钱小 tip——把 embedding 放在本地](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483678&idx=1&sn=2eedf4ecebf1063ff17186b335e0dc0b&scene=21#wechat_redirect)

也欢迎链接到我本人：**soplaoming**，一起交流奇思妙想，一起利用小龙虾搞钱。
