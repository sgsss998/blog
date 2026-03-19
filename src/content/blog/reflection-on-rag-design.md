---
title: 反思我的RAG设计-为什么OpenClaw更优雅
description: 我那套"精心设计"的 RAG 系统，在 OpenClaw 面前，就像一个过度焦虑的父母，对孩子管得太多、太细，反而绑住了孩子的手脚。
pubDate: 2025-03-14
heroImage: https://mmbiz.qpic.cn/mmbiz_jpg/BoK1f5xsXyqrY9GGgX1NTeDaS5oFufv74frLTvEXeOYiasicuYHkp9s8z1GDKpLz9bFeiaFxLpGHguyGIToTI5sTUuZWbv3dtpE3erMHwPZZ34/0?wx_fmt=jpeg
---

我在 GitHub 上开源了一套 RAG 记忆系统（https://github.com/sgsss998/RAG_Memory_System_Public）

折腾了大半个月，功能齐备：混合检索、权重系统、身份锚点、角色辨别、推理边界……代码写了小两千行，prompt 磨了几十版，自以为挺完善了。

然后我认真研究了 OpenClaw 的记忆模块源码。

看完之后，我沉默了。

## 我的方案：过度工程化

每次用户问问题，代理网关先把问题截下来，送去海马体检索，捞几条相关记忆，然后塞进 prompt 里，再发给 LLM。为了让 LLM 正确使用这些记忆，我让 AI写了一堆规则：

```
【回答优先级 - 从高到低】
1. 身份锚点中的固定信息 → 最高优先级，直接用
2. 记忆切片中明确是"我"说的内容 → 直接用
3. 基于以上两点的合理推理 → 可以用
4. 完全没有依据的猜测 → 禁止！
【角色辨别规则 - 重要！】
- 记忆切片中的 ID、微信号、手机号通常是【聊天对象的】
...
```

但问题来了：这些规则，LLM 真的能完美遵守吗？

**不可能。**

规则越多，LLM 越困惑。更要命的是——**不管用户问什么，海马体都先检索一遍。**

"帮我写个 hello world"——检索。
"今天天气怎么样"——检索。
"1+1 等于几"——检索。

浪费。纯粹的浪费。

## OpenClaw 的方案：信任

再来看 OpenClaw 的方案，我读出了两个字：信任。

它给 LLM 装了一个工具，叫 `memory_search`。工具描述就几行字：

```
"Mandatory recall step: semantically search MEMORY.md + memory/*.md
(and optional session transcripts) before answering questions about
prior work, decisions, dates, people, preferences, or todos;
returns top snippets with path + lines."
```

然后 system prompt 里加一句话：

```
"Before answering anything about prior work, decisions, dates, people,
preferences, or todos: run memory_search... then use memory_get to
pull only the needed lines. If low confidence after search, say you checked."
```

没了。就这么多。

LLM 读到问题，自己判断要不要搜记忆。要搜就调工具，不要搜就直接回答。检索结果只拉需要的几行，不是整篇文档。

没有"回答优先级"的复杂规则，没有"角色辨别"的冗长说明，没有"沟通协议"的风格限制。OpenClaw 信任 LLM，让 LLM 自己决定怎么回答。

**效果反而更好。**

## 核心的差异：控制 vs 信任

我的方案，本质上是**不信任 LLM**。我怕它乱说，所以加"回答优先级"；我怕它角色混淆，所以加"角色辨别规则"；我怕它说话不像我，所以加"沟通协议"。

每一条规则，都是对 LLM 能力的不信任。结果就是：LLM 被绑得死死的，变成了一个只会照本宣科的复读机。

而 OpenClaw 的方案，本质上是**信任 LLM**。

它相信 LLM 知道什么时候该搜索、什么时候该推理、什么时候该承认不确定。它不给 LLM 穿小鞋，不限制 LLM 的表达风格。它只给 LLM 一个工具、一个简单的使用说明，然后放手让它干。

## 两个方案的对比

| 维度 | 我的方案 | OpenClaw |
| --- | --- | --- |
| 检索触发 | 每次都检索 | LLM 按需调用 |
| Token 消耗 | 固定开销 | 按需消耗 |
| Prompt 规则 | 几十条 | 几行 |
| LLM 自主性 | 被动接受 | 主动决策 |
| 风格限制 | 强制约束 | 自然表达 |
| 失败处理 | 复杂兜底 | "说查过了" |
| 心智模型 | 控制 | 信任 |

---

我那套"精心设计"的 RAG 系统，在 OpenClaw 面前，就像一个过度焦虑的父母，对孩子管得太多、太细，反而绑住了孩子的手脚。

OpenClaw 像一个开明的父母，给孩子一个工具、一个简单的说明，然后放手让它自己去探索。

**不得不服，OpenClaw，有点东西。**
