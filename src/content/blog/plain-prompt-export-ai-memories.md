---
title: "朴素的提示词，让 AI 导出关于你的所有记忆"
description: "我的 AI 记忆是四处散落的，这里一块，那里一块：cursor、Gemini、元宝、deepseek、kimi、claude code、openclaw…… 我想把我在全网散落的、关于我和 AI 对话的所有记忆都保存下来，集合在一处，形成我的宝贵记忆库，供 AI 分析和总结。 我想到两种方法，一种是利用 chatmemo工具，自动保存网页端对话记忆。 这个 chatmemo 是个宝藏工具，我们下次再聊。本文先讲另一种方法： 另一种方法…"
pubDate: 2026-04-12
keywords: ["Cursor", "记忆", "提示词", "导出"]
heroImage: "/images/blog/plain-prompt-export-ai-memories-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/C8LBrGelkf6krJkUPURZkQ)
我的 AI 记忆是四处散落的，这里一块，那里一块：cursor、Gemini、元宝、deepseek、kimi、claude code、openclaw……我想把我在全网散落的、关于我和 AI 对话的所有记忆都保存下来，集合在一处，形成我的宝贵记忆库，供 AI 分析和总结。我想到两种方法，一种是利用 chatmemo工具，自动保存网页端对话记忆。![](/images/blog/plain-prompt-export-ai-memories-wechat-01.png)这个 chatmemo 是个宝藏工具，我们下次再聊。本文先讲另一种方法：另一种方法则是利用提示词，让 AI 帮我导出关于我的所有记忆。于是我恰好看到了网上流传比较广的一个提示词：网上大神的提示词：I need to export my data. List every memory you have stored about me, as well as any context you've learned about me from past conversations. Output everything in a single code block so I can easily copy it. Format each entry as: [date saved, if available] - memory content. Make sure to cover all of the following — preserve my words verbatim where possible: Instructions I've given you about how to respond (tone, format, style, 'always do X', 'never do Y'). Personal details: name, location, job, family, interests. Projects, goals, and recurring topics. Tools, languages, and frameworks I use. Preferences and corrections I've made to your behavior. Any other stored context not covered above. Do not summarize, group, or omit any entries. After the code block, confirm whether that is the complete set or if any remain.实际效果：（我觉得有点拉闸）![](/images/blog/plain-prompt-export-ai-memories-wechat-02.png)导出的数据残缺不全。基本没啥用。

* * *

  
我的提示词：（更朴素）话说我和你在这里对话的所有重要信息和历史记录，你可以帮我总结成一个 md 供我导出吗，这是很宝贵的历史资料（包括所有的 cursor 的我和你的聊天记录，尽可能的总结给我）实际效果：![](/images/blog/plain-prompt-export-ai-memories-wechat-03.png)  
![](/images/blog/plain-prompt-export-ai-memories-wechat-04.png)![](/images/blog/plain-prompt-export-ai-memories-wechat-05.png)问完之后，cursor 就把本地的所有已保存的关于我的问答纪录、以及概要都总结出来了，并且汇总成了一个 md 文档。效果相对而言更好一些。

* * *

  
我的看法：提示词并不以字数长、格式缜密为能，只要能把意思清晰表达到位，有时候越朴素的提示词，反而效果越好。
