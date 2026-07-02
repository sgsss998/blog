---
title: "Openclaw小龙虾的实操干货与心得感受合集（一）"
description: "此贴为小龙虾实战小 tips，想到哪写到哪，仅供大家参考，纯属主观判断，其中不乏谬误，请谨慎取舍。 1，安装小龙虾的唯一建议： AI helps AI：用 claude code 帮你安装openclaw，具体原因如下图： 所以，在安装 Openclaw 小龙虾之前，你需要先安装 claude code（简称 cc）。 安装 claude code 是一切开始的开始—— 等你真正体验过就会懂， 有了 cc，你就可以利用 cc 帮你做几…"
pubDate: 2026-03-21
keywords: ["AI干货家老明", "微信公众号同步"]
heroImage: "/images/blog/openclaw-practical-notes-collection-01-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/OBVoD5nDpReJOaAJj-giEg)
此贴为小龙虾实战小 tips，想到哪写到哪，仅供大家参考，纯属主观判断，其中不乏谬误，请谨慎取舍。1，安装小龙虾的唯一建议：AI helps AI：用 claude code 帮你安装openclaw，具体原因如下图：![](/images/blog/openclaw-practical-notes-collection-01-wechat-01.png)所以，在安装 Openclaw 小龙虾之前，你需要先安装 claude code（简称 cc）。安装 claude code 是一切开始的开始——等你真正体验过就会懂，有了 cc，你就可以利用 cc 帮你做几乎任何事情了。cc 的功能特别强大，2026普通人最首要的目标是一定一定一定要把 cc 装好并使用，如果你之前没用过 cc，那么一定会颠覆你对整个 AI 的想法，这个玩意儿和豆包、deepseek、千问、kimi chat根本就不是一个维度的东西，免费的那些AI只是你问我答的“聊天机器人”，而 cc 是真的生产力工具，懂得都懂我在说些什么。详细教程可以参见这篇文章：[Claude Code入门指南，看这一篇就够了 | 保姆级教程](https://mp.weixin.qq.com/s?__biz=MzIwMTU5OTQ1Nw==&mid=2653723996&idx=1&sn=49703300983c1f0dc752db62516c9f0c&scene=21#wechat_redirect)，可以把 cc接入国产 glm-5 大模型，这样就避免了被封号的风险。

站内版不再保留旧折扣链接或套餐推广信息。工具价格、套餐和可用性变化很快，建议以官网当前页面为准。

2，千万别把小龙虾想得太高大上。这类工具能力有限，上限取决于大模型本身的能力，也取决于你给它的权限、资料和任务边界。![](/images/blog/openclaw-practical-notes-collection-01-wechat-02.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-03.png)小龙虾是 AI 组合式创新的典范，把 skill、prompt、mcp、本地 rag 等等实用工具封装到一起，也改变了 AI 时代保存记忆的方法：把原本属于大模型厂商的记忆（上下文），转移到本地 markdown 文本，让个体记忆的归属权和定义权回到本地。![](/images/blog/openclaw-practical-notes-collection-01-wechat-04.png)3，模型套餐和调用成本要动态看。早期我用过低成本套餐，日常中轻度任务已经能跑起来；但工具价格、容量和速度变化很快，站内版不再保留旧价格截图，也不把旧套餐当成当前建议。![](/images/blog/openclaw-practical-notes-collection-01-wechat-05.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-06.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-07.png)真正应该关注的是：你的任务频率、可接受速度、上下文长度和失败重试成本，而不是某一刻的套餐截图。

4，把小龙虾的云端 embedding 改到本地，可以节省成本。![](/images/blog/openclaw-practical-notes-collection-01-wechat-08.png)具体方法参见：[Openclaw养小龙虾省钱小 tip——把 embedding 放在本地](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483678&idx=1&sn=2eedf4ecebf1063ff17186b335e0dc0b&scene=21#wechat_redirect)5，extra-path-memory：这是小龙虾的拓展记忆库。也就是相当于给你的小龙虾开了脑机接口，除了它本身本地的记忆外，还外链了一个超大的 RAG记忆库（小龙虾把所有 rag 的过程都默认自动完成了）。这个功能简直不要太酷！![](/images/blog/openclaw-practical-notes-collection-01-wechat-09.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-10.png)这个功能非常非常非常实用，请一定要好好使用，可以极大地拓展你的小龙虾的记忆能力。6，配置多Agent系统时踩过的坑：永远不要在Discord公开场合暴露Token。要在私聊或者本地配置文件里操作。

一开始我在公开场景里处理过 Bot Token，结果很快触发平台风控。这个坑非常典型：任何 Token、Key、Webhook、账号授权信息，都应该只在私聊、本地配置文件或安全的密钥管理流程里操作。

![](/images/blog/openclaw-practical-notes-collection-01-wechat-11.jpg)7，推荐一些 AI 自媒体账号：![](/images/blog/openclaw-practical-notes-collection-01-wechat-12.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-13.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-14.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-15.png)  
  
  
先写这么多，后面等想到了再分享。站内版不再直接展示旧群二维码；想交流 OpenClaw、Codex、RAG 和个人 AI 工作流，可以通过网站上的微信入口备注来意。![](/images/blog/openclaw-practical-notes-collection-01-wechat-16.png)
