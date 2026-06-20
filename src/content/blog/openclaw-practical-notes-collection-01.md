---
title: "Openclaw小龙虾的实操干货与心得感受合集（一）"
description: "此贴为小龙虾实战小 tips，想到哪写到哪，仅供大家参考，纯属主观判断，其中不乏谬误，请谨慎取舍。 1，安装小龙虾的唯一建议： AI helps AI：用 claude code 帮你安装openclaw，具体原因如下图： 所以，在安装 Openclaw 小龙虾之前，你需要先安装 claude code（简称 cc）。 安装 claude code 是一切开始的开始—— 等你真正体验过就会懂， 有了 cc，你就可以利用 cc 帮你做几…"
pubDate: 2026-03-21
keywords: ["AI干货家老明", "微信公众号同步"]
heroImage: "/images/blog/openclaw-practical-notes-collection-01-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/OBVoD5nDpReJOaAJj-giEg)
此贴为小龙虾实战小 tips，想到哪写到哪，仅供大家参考，纯属主观判断，其中不乏谬误，请谨慎取舍。1，安装小龙虾的唯一建议：AI helps AI：用 claude code 帮你安装openclaw，具体原因如下图：![](/images/blog/openclaw-practical-notes-collection-01-wechat-01.png)所以，在安装 Openclaw 小龙虾之前，你需要先安装 claude code（简称 cc）。安装 claude code 是一切开始的开始——等你真正体验过就会懂，有了 cc，你就可以利用 cc 帮你做几乎任何事情了。cc 的功能特别强大，2026普通人最首要的目标是一定一定一定要把 cc 装好并使用，如果你之前没用过 cc，那么一定会颠覆你对整个 AI 的想法，这个玩意儿和豆包、deepseek、千问、kimi chat根本就不是一个维度的东西，免费的那些AI只是你问我答的“聊天机器人”，而 cc 是真的生产力工具，懂得都懂我在说些什么。详细教程可以参见这篇文章：[Claude Code入门指南，看这一篇就够了 | 保姆级教程](https://mp.weixin.qq.com/s?__biz=MzIwMTU5OTQ1Nw==&mid=2653723996&idx=1&sn=49703300983c1f0dc752db62516c9f0c&scene=21#wechat_redirect)，可以把 cc接入国产 glm-5 大模型，这样就避免了被封号的风险。

https://www.bigmodel.cn/glm-coding?ic=D9UBA5ADGA

对了，以上是我的 glm 邀请码，用它购买智谱的套餐可以有一些折扣，具体多少我还不知道，但是肯定有优惠。如果你需要的话，直接在购买套餐的时候复制上面邀请码就可以了。

2，千万别把小龙虾想得太高大上。这玩意儿能力有限，上限取决于大模型本身的能力，小龙虾能做的事儿 cc 全都能做，所以真别神话他。。之所以他被吹的那么神是因为他“无法无天”，权限太大了，几乎具备你的计算机一切权限，当然厉害了...cc有那么多权限照样能做小龙虾做的这些事。![](/images/blog/openclaw-practical-notes-collection-01-wechat-02.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-03.png)小龙虾是AI组合式创新的典范，几乎把 skill、prompt、mcp、本地 rag 等等所有实用的 AI 工具杂糅、封装在一起，创造了交互方式的革命，也颠覆了 AI 时代保存记忆的方法——这是我觉得小龙虾最牛逼的地方，把原本属于大模型厂商的记忆（上下文），转移到了本地 markdown文本，将个体记忆的归属权和定义权从云端llm抢夺回到了本地，太牛逼了。![](/images/blog/openclaw-practical-notes-collection-01-wechat-04.png)3，养小龙虾的费用没想象中那么夸张，一个月 29 元就够了。minimax 2.5 的月 plan 套餐，见下图。![](/images/blog/openclaw-practical-notes-collection-01-wechat-05.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-06.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-07.png)如上图，我一个月不到用了 5 亿多的 token，套餐容量还是绰绰有余（除了速度有点慢），29 元一个月完全够用日常的中轻度任务了。如果你也需要，可以使用我的邀请码，也有优惠：

👉 立即参与：https://platform.minimaxi.com/subscribe/token-plan?code=2F0D3AcyKp&source=link

4，把小龙虾的云端 embedding 改到本地，可以节省成本。![](/images/blog/openclaw-practical-notes-collection-01-wechat-08.png)具体方法参见：[Openclaw养小龙虾省钱小 tip——把 embedding 放在本地](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483678&idx=1&sn=2eedf4ecebf1063ff17186b335e0dc0b&scene=21#wechat_redirect)5，extra-path-memory：这是小龙虾的拓展记忆库。也就是相当于给你的小龙虾开了脑机接口，除了它本身本地的记忆外，还外链了一个超大的 RAG记忆库（小龙虾把所有 rag 的过程都默认自动完成了）。这个功能简直不要太酷！![](/images/blog/openclaw-practical-notes-collection-01-wechat-09.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-10.png)这个功能非常非常非常实用，请一定要好好使用，可以极大地拓展你的小龙虾的记忆能力。6，配置多Agent系统时踩过的坑：永远不要在Discord公开场合暴露Token。要在私聊或者本地配置文件里操作。

一开始我在Discord群里直接粘贴Bot Token，想让小龙虾agent1 直接帮我创建好小龙虾agent2，结果被Discord官方检测到，Bot直接被封了2小时。

![](/images/blog/openclaw-practical-notes-collection-01-wechat-11.jpg)7，推荐一些 AI 自媒体账号：![](/images/blog/openclaw-practical-notes-collection-01-wechat-12.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-13.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-14.png)![](/images/blog/openclaw-practical-notes-collection-01-wechat-15.png)  
  
  
先写这么多，后面等想到了再分享。最后，这是我的 AI 干货交流群，三群目前开放加入，人还没满，欢迎进群一起交流～![](/images/blog/openclaw-practical-notes-collection-01-wechat-16.png)
