---
title: "AI赚钱实证系列1/100（第一期）——报销 Skill"
description: "用 AI 把一个高频办公流程做成可复用 Skill：从报销材料整理、附件命名、事由模板到脱敏公开样例，验证 AI 如何把重复劳动沉淀成可交付的 SOP。"
pubDate: 2026-03-25
keywords: ["AI赚钱", "OpenClaw", "skill", "报销"]
heroImage: "/images/blog/ai-money-series-01-reimburse-skill-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/sAApNn-43g1Ih2cS1OwwUw)
我准备开一个专题，名字就叫做：AI赚钱实证系列这个专题不搞任何虚头巴脑的东西，只亮家伙、玩儿真的——我选 100 个idea，然后用 AI 把这个 idea 最快速地从 0-1 落地，看看这个 idea 能给我带来多少收入。这个系列一共会做 100 期，每期都是一个不同的 idea。  
每期的内容格式都是：1，这期是什么 idea；2，我是如何把它落地的，具体的方法和过程阐述；3，截至目前给我带来了多少收入。  
不玩儿虚的，我们直接干真的——idea is cheap，show me the result.  


* * *

  
第一期正式开始：第一期的 idea 是一个小龙虾的报销 skill（已脱敏 / 仅个人工作流 / 不构成财务报销建议）  
![](/images/blog/ai-money-series-01-reimburse-skill-wechat-01.png)制作难度：低制作耗时：约 3 小时制作方法：openclaw+minimax2.5交付形式：skill.md实际使用效果：不错。  


心血来潮，花三小时用openclaw搭了一个报销的skill-sop，已经迭代了四个版本：

v1就是能跑通，收到材料建文件夹打包；v2删掉多余废话；v3开始认真——发现财务要看得懂前因后果，不只是金额，还要发票税率和订单明细；v4固化最优结构，每笔单独文件夹，凭证分类放。

现在，我只需要把脱敏后的材料样例和整理规则交给它，它就能按照费用项拆分条目、生成事由草稿、规范文件命名，并把流程沉淀成下一次可以复跑的 SOP。真实材料仍然需要人工核验和按规则处理，AI 只负责整理流程，不替代财务判断。

花三小时，节省了未来的十小时，甚至更多，很值。

以后我再也不用花一整天的时间来整理报销单据了，哈哈。

对了，最方便的是，这个报销sop可以直接通过微信传输给我，我可以直接一键转发，实在是太方便了。连“下载”-“保存”-“导出”这个步骤都省了。有一种莫名的愉悦感和畅快感。

![](/images/blog/ai-money-series-01-reimburse-skill-wechat-02.png)

站内版不展示真实报销材料截图，只保留公开安全示意：![](/images/blog/ai-money-series-01-reimburse-skill-wechat-03.png)![](/images/blog/ai-money-series-01-reimburse-skill-wechat-04.jpg)这个流程真正有价值的地方，不是“替你报销”，而是把凭证分类、附件命名、事由草稿、目录结构和人工核验口径固定下来。以前这些动作都靠手动记忆和临场整理，一套流程下来很容易耗掉几个小时；做成 Skill 之后，同类任务可以按同一套规则复跑，交付结果也更容易检查。
对于这个 skill，我想到了几个变现路径：1，作为教程，打包成 pdf，在内容平台或私域里做低门槛分发。（这类资料包适合先做低门槛验证，但价格和渠道需要随阶段调整）2，作为开源项目，放在 github和个人网站上，增强个人影响力。开源地址：

https://github.com/sgsss998/reimburse-skill-sanitized/tree/master

但这样的话就比较难以量化收益。但长期来看，肯定有正向的帮助。

3，对我自身而言，解放了我的精力，减少了工作时间，假设我每个季度报销一次，报销一次原本需要整理 3-5 小时，如果按照时薪来算，那一个季度就能节省 xxxx 元，一年就能节省 xxxxx 元。这也是一笔隐性的收入。

  


![](/images/blog/ai-money-series-01-reimburse-skill-wechat-05.png)

这个 skill 很简单，就一个 readme，一个 md，一个报销事由的模板。都经过了脱敏处理，请放心食用。

  


目前这类 Skill 更适合作为公开样例和服务入口：一方面验证真实需求，另一方面让读者看到可复用 SOP 应该长什么样。后续收益和转化会按实际数据复盘。
