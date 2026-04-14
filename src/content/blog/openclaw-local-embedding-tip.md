---
title: OpenClaw省钱技巧：本地Embedding部署指南｜节省Token费用
description: OpenClaw本地部署embedding教程，使用Ollama+bge-m3替代云端API，每天节省90%的Token费用。包含完整配置步骤和性能对比。
pubDate: 2026-03-10
heroImage: /images/blog/openclaw-local-embedding-tip.jpg
keywords: [OpenClaw, Embedding本地化, Ollama, bge-m3, Token省钱, AI记忆系统, 向量化, Claude Code]
---

最近"养小龙虾"火了。

但养过小龙虾的都知道，这玩意儿吃 token，吃得凶。

OpenClaw 有个三级记忆系统：短期日志、近端会话、长期知识。长期记忆怎么存？靠的是 embedding——把你的对话、文档切成小段，每段变成一个向量，存进本地数据库。下次你问问题，系统先把问题也变成向量，去库里找最相近的片段，捞出来塞进上下文。

Embedding 是什么？一句话：把文字变成一串数字（向量），让计算机能判断两段文字"像不像"。

问题就出在这儿。默认配置下，embedding 走的是云端 API（比如 OpenAI、Voyage AI）。每次对话、每次记忆更新，都要调 API。OpenClaw 的心跳机制还特别勤快，频繁调用，加上检索的时候要捞一堆候选片段塞进 prompt，token 消耗就这么炸了。

text-embedding-3-small 是 $0.02/百万 tokens，看起来便宜，但一个中等项目动辄几十万行代码，切成 chunks 之后可能就是几千万 tokens，重建一次几美元，频繁更新下来钱包遭不住。

**所以我就把 embedding 换成本地跑了。**

## 配置方法

OpenClaw 支持对接 Ollama 的 OpenAI 兼容 API，配置很简单。先装 Ollama，再拉一个向量模型，比如 bge-m3：

```bash
brew install ollama
ollama pull bge-m3
ollama serve
```

然后在 OpenClaw 的配置里，把 embedding endpoint 改成本地地址，模型填 `bge-m3`，完事。

## 效果对比

| 指标 | 云端 API (OpenAI/Voyage) | 本地 bge-m3 |
| --- | --- | --- |
| 成本 | $0.02/百万 tokens 起 | **$0** |
| 速度 | 受网络影响，可能超时 | 本地毫秒级 |
| 隐私 | 数据上云 | 完全本地 |
| 质量 | 顶尖 | 中上，中文甚至更好 |

质量方面，bge-m3 在 MTEB 榜单上不算最顶尖的那档，但 OpenClaw 这种个人助手场景完全够用。中文场景下甚至比 OpenAI 的模型更准——毕竟是国内团队训的，中文语料占比更高。

当然也不是说本地 embedding 万能。如果你是生产环境、高并发、对精度要求极高，那还是老实掏钱买 API 吧。但对于养小龙虾这种个人使用场景，本地跑 embedding 是个性价比极高的选择。

这样，不管小龙虾帮你记多少东西、检索多少次，embedding 这块的成本都是零。M 系列 Mac 上跑得很轻松，16G 内存的机器就够用。M4 Mini 上单条 50-100ms，批处理 1000 条 30 秒左右，速度完全够用。而且本地跑，隐私也不用担心，代码不往外传。

**小龙虾的记忆能力照常工作，喂养成本直接砍掉一大截。省下的钱，留着给真正烧钱的推理环节吧。**

---

参考资源：
- [Ollama](https://ollama.ai)
- [bge-m3: https://huggingface.co/BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
