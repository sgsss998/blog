---
title: 多个微信，可以各自连接一个独立的小龙虾 agent
description: 多个微信入口分别绑定不同 Agent 的公开架构思路；OpenClaw 多 Channel 路由原理与 openclaw.json 脱敏配置示例。
pubDate: 2026-03-28
heroImage: /images/blog/openclaw-multi-wechat-cover.jpg
keywords: [OpenClaw, 小龙虾, 微信, 多 Agent, 路由, Channel, Gateway, AI干货家老明]
---

> **原文首发**：[微信公众号 · 多个微信，可以各自连接一个独立的小龙虾agent](https://mp.weixin.qq.com/s/peZ20b9y1S5QLP3Z73N3bA)

这篇只保留公开架构思路：多个微信入口可以分别绑定到不同 Agent，让不同类型的任务走不同的执行链路。站内版已移除真实设备型号、私人微信截图、个人记忆文件名和贴身助理配置细节，只讨论可复用的方法。

![多微信入口分别连接不同 Agent 的脱敏示意图](/images/blog/openclaw-multi-wechat-phones.jpg)

最简单的分法是把 Agent 分成两类：

- **执行型 Agent**：处理文档、代码、检索、图片、PPT、资料整理等需要落地交付的任务。
- **记录型 Agent**：处理待办、提醒、简单信息归档和日常问答，不直接接触高风险文件。

这两个 Agent 可以共享少量公共规则，但不要共享所有私人资料。公共规则用于统一口径，私密资料则按权限隔离。这样做的好处是：消息入口清晰、任务边界清晰，某个 Agent 配错权限时，也不至于影响整个系统。

## OpenClaw 接入微信的原理

![微信接入 OpenClaw 的基础架构示意图](/images/blog/openclaw-multi-wechat-architecture.jpg)

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
[微信B] ──┼──→ [Gateway] ──→ [路由规则] ──→ [执行型 Agent]
[微信C] ──┘                    └──→ [记录型 Agent]
                                └──→ [其他 Agent]
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
          "id": "wechat-main",
          "account": "xxxxxxxx",
          "routing": {
            "agent": "main"
          }
        },
        {
          "id": "wechat-notes",
          "account": "ACCOUNT_PLACEHOLDER_2",
          "routing": {
            "agent": "notes"
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
[微信B] ──┼──→ [Gateway] ──→ [路由规则] ──→ [执行型 Agent]
[微信C] ──┘                    └──→ [记录型 Agent]
                                └──→ [其他 Agent]

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

也如果你也在折腾多 Agent 路由，可以先从一个执行入口和一个低风险记录入口开始，跑通后再慢慢扩展。
