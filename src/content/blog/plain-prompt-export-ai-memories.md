---
title: "朴素的提示词，让 AI 导出关于你的所有记忆"
description: "我的 AI 记忆是四处散落的，这里一块，那里一块：cursor、Gemini、元宝、deepseek、kimi、claude code、openclaw…… 我想把我在全网散落的、关于我和 AI 对话的所有记忆都保存下来，集合在一处，形成我的宝贵记忆库，供 AI 分析和总结。 我想到两种方法，一种是利用 chatmemo工具，自动保存网页端对话记忆。 这个 chatmemo 是个宝藏工具，我们下次再聊。本文先讲另一种方法： 另一种方法…"
pubDate: 2026-04-12
keywords: ["Cursor", "记忆", "提示词", "导出"]
heroImage: "/images/blog/plain-prompt-export-ai-memories-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/C8LBrGelkf6krJkUPURZkQ)
我的 AI 记忆是四处散落的，这里一块，那里一块：cursor、Gemini、元宝、deepseek、kimi、claude code、openclaw……我想把我在全网散落的、关于我和 AI 对话的所有记忆都保存下来，集合在一处，形成我的宝贵记忆库，供 AI 分析和总结。我想到两种方法，一种是利用 chatmemo工具，自动保存网页端对话记忆。![](/images/blog/plain-prompt-export-ai-memories-wechat-01.png)这个 chatmemo 是个宝藏工具，我们下次再聊。本文先讲另一种方法：另一种方法则是利用提示词，让 AI 帮我导出关于我的所有记忆。于是我恰好看到了网上流传比较广的一个提示词：网上大神的提示词：I need to export my data. List every memory you have stored about me, as well as any context you've learned about me from past conversations. Output everything in a single code block so I can easily copy it. Format each entry as: [date saved, if available] - memory content. Make sure to cover all of the following — preserve my words verbatim where possible: Instructions I've given you about how to respond (tone, format, style, 'always do X', 'never do Y'). Personal details: name, location, job, family, interests. Projects, goals, and recurring topics. Tools, languages, and frameworks I use. Preferences and corrections I've made to your behavior. Any other stored context not covered above. Do not summarize, group, or omit any entries. After the code block, confirm whether that is the complete set or if any remain.实际效果没有达到预期：![](/images/blog/plain-prompt-export-ai-memories-wechat-02.png)导出的数据残缺不全，只能作为一个起点。

* * *

  
我的提示词更朴素：请把这里对话中的重要信息、历史记录和可复用上下文总结成一个 md 文档，方便后续导出和整理。站内版不展示原始导出截图，只保留脱敏后的方法说明：![](/images/blog/plain-prompt-export-ai-memories-wechat-03.png)  
![](/images/blog/plain-prompt-export-ai-memories-wechat-04.png)![](/images/blog/plain-prompt-export-ai-memories-wechat-05.png)问完之后，AI 把已保存的问答记录和概要整理成了一个 md 文档。这个版本的效果更好，也提醒我：做长期记忆库时，提示词要说清楚目标、范围和输出格式，但公开展示时必须先处理本地路径、会话记录和个人内容索引。

* * *

  
我的看法：提示词并不以字数长、格式缜密为能，只要能把意思清晰表达到位，有时候越朴素的提示词，反而效果越好。
