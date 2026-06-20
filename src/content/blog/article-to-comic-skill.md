---
title: "把你写的文章转化成连环漫画的skill"
description: "公众号、知乎、飞书文档里，长文越来越多；但读者的耐心越来越少。你写得很认真，对方却只想划三下屏幕。 我最近把一个“把文章拆成多格漫画图”的工作流，整理成可复制的 Agent Skill，开源在 GitHub：sgsss998/article-to-comic.skill。它不承诺替你写出爆款，只解决一件事： 把长逻辑变成一串看得懂、传得动的图 。 最难的不是画图，是先把文章讲清楚：分镜对了，后面才值得自动化。 一、这个 Skill 在…"
pubDate: 2026-04-25
keywords: ["AI干货家老明", "微信公众号同步"]
heroImage: "/images/blog/article-to-comic-skill-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/Uwvd4H_X_HmOj39lRGikEQ)
# ![连环漫画.skill 封面：文章转连环漫画工作流](/images/blog/article-to-comic-skill-wechat-01.png)

公众号、知乎、飞书文档里，长文越来越多；但读者的耐心越来越少。你写得很认真，对方却只想划三下屏幕。

我最近把一个“把文章拆成多格漫画图”的工作流，整理成可复制的 Agent Skill，开源在 GitHub：sgsss998/article-to-comic.skill。它不承诺替你写出爆款，只解决一件事：**把长逻辑变成一串看得懂、传得动的图** 。

最难的不是画图，是先把文章讲清楚：分镜对了，后面才值得自动化。

## 一、这个 Skill 在做什么

仓库里的 `连环漫画.skill`，把流程压成六步：读文章、拆观点、规划分镜、逐帧写 Prompt、串行调用图像 API、下载并按序交付。你负责给原文与目标平台；它负责把“一张图讲一件事”执行到底。

  * 提炼核心观点，避免一图塞满十个信息点
  * 每帧单独 Prompt，风格统一（例如职场漫画 / comic）
  * 串行请求，降低并发失败概率
  * 输出目录与 JSON 响应归档，方便复查与重画某一帧



## 二、四篇往期文章：深度分镜概括（每篇 6 张）

下面四篇我全部改成“对比图 + 6 张连续分镜”展示，你可以直观看到从开场、核心论点到收束结论的完整表达链路。

### 例一：[《为什么我们需要建立 AI 记忆库》](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483667&idx=1&sn=a479b7a00268fbec603241b6e1c970be&scene=21#wechat_redirect)

![例一对比图](/images/blog/article-to-comic-skill-wechat-02.png)例一对比图（左原文摘录，右漫画）![例一分镜1](/images/blog/article-to-comic-skill-wechat-03.png)![例一分镜2](/images/blog/article-to-comic-skill-wechat-04.png)![例一分镜3](/images/blog/article-to-comic-skill-wechat-05.png)![例一分镜4](/images/blog/article-to-comic-skill-wechat-06.png)![例一分镜5](/images/blog/article-to-comic-skill-wechat-07.png)![例一分镜6](/images/blog/article-to-comic-skill-wechat-08.png)

### 例二：[《Openclaw 小龙虾：embedding 放本地》](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483678&idx=1&sn=2eedf4ecebf1063ff17186b335e0dc0b&scene=21#wechat_redirect)

![例二对比图](/images/blog/article-to-comic-skill-wechat-09.png)例二对比图（左原文摘录，右漫画）![例二分镜1](/images/blog/article-to-comic-skill-wechat-10.png)![例二分镜2](/images/blog/article-to-comic-skill-wechat-11.png)![例二分镜3](/images/blog/article-to-comic-skill-wechat-12.png)![例二分镜4](/images/blog/article-to-comic-skill-wechat-13.png)![例二分镜5](/images/blog/article-to-comic-skill-wechat-14.png)![例二分镜6](/images/blog/article-to-comic-skill-wechat-15.png)

### 例三：[《Cursor 全局 Rule / RIPER-5》](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483708&idx=1&sn=3b48481d9a64b57f2d424a435680e7f1&scene=21#wechat_redirect)

![例三对比图](/images/blog/article-to-comic-skill-wechat-16.png)例三对比图（左原文摘录，右漫画）![例三分镜1](/images/blog/article-to-comic-skill-wechat-17.png)![例三分镜2](/images/blog/article-to-comic-skill-wechat-18.png)![例三分镜3](/images/blog/article-to-comic-skill-wechat-19.png)![例三分镜4](/images/blog/article-to-comic-skill-wechat-20.png)![例三分镜5](/images/blog/article-to-comic-skill-wechat-21.png)![例三分镜6](/images/blog/article-to-comic-skill-wechat-22.png)

### 例四：[《因为GPT-image-2，整个互联网都变成了巨大的黑暗森林》](https://mp.weixin.qq.com/s?__biz=MzIyMzA5NjEyMA==&mid=2647681743&idx=1&sn=2cf279a5500c30c343ac39fd3a9c3d32&scene=21#wechat_redirect)

![例四对比图](/images/blog/article-to-comic-skill-wechat-23.png)例四对比图（左原文摘录，右漫画）![例四分镜1](/images/blog/article-to-comic-skill-wechat-24.png)![例四分镜2](/images/blog/article-to-comic-skill-wechat-25.png)![例四分镜3](/images/blog/article-to-comic-skill-wechat-26.png)![例四分镜4](/images/blog/article-to-comic-skill-wechat-27.png)![例四分镜5](/images/blog/article-to-comic-skill-wechat-28.png)![例四分镜6](/images/blog/article-to-comic-skill-wechat-29.png)

**原文官方链接（节选对照用）：**  
例一：[https://mp.weixin.qq.com/s/7ooYhcH9Xctw6V-Q-Hma1g](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483667&idx=1&sn=a479b7a00268fbec603241b6e1c970be&scene=21#wechat_redirect)  
例二：[https://mp.weixin.qq.com/s/V361zLA42e-uh6rbWkkQOw](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483678&idx=1&sn=2eedf4ecebf1063ff17186b335e0dc0b&scene=21#wechat_redirect)  
例三：[https://mp.weixin.qq.com/s/Rfc-dm2ObzhFMDc01NzJlA](https://mp.weixin.qq.com/s?__biz=MzY5MjE4ODg5MA==&mid=2247483708&idx=1&sn=3b48481d9a64b57f2d424a435680e7f1&scene=21#wechat_redirect)  
例四：[https://mp.weixin.qq.com/s/zua1k53RovAOk15Juy6q3g](https://mp.weixin.qq.com/s?__biz=MzIyMzA5NjEyMA==&mid=2647681743&idx=1&sn=2cf279a5500c30c343ac39fd3a9c3d32&scene=21#wechat_redirect)  
索引页（与仓库同步）：examples/SOURCES.md

## 三、公开版怎么接你自己的 API

README 与 skill 文件里，Endpoint 和 Key 一律是占位符：`YOUR_IMAGE_ENDPOINT`、`YOUR_IMAGE_API_KEY`。你只要换成自己兼容 `nano-banana-pro-light-t2i` 的地址即可。公开仓库不内置真实密钥，这是刻意设计。

  * 推荐画幅：`16x9`（注意是小写 `x`，不是冒号比例写法）
  * 默认输出目录示例：`./outputs/comic/`
  * 单帧间隔几秒，避免限流与超时叠在一起



## 四、版本迭代（当前 CHANGELOG 对齐）

仓库地址：CHANGELOG.md。目前节点不多，但每一版都对应真实踩坑，而不是改个版本号好看。

### v0.1：先把「能公开、能复用」跑通

  * **v0.1** 首次公开版；脱敏（去掉明文 Key、本机路径等）；README 结构对齐 baoxiao.skill 的阅读习惯（版本区、用法、FAQ、文末二维码与收款码引用）。



### v0.2：封面与表述收口

  * **v0.2** 用图像 API 重生成封面；首张叠加水印「AI干货家老明」；第二张画面只保留「API」等泛称；文档里统一用「图像生成 API + 占位 Endpoint」表述。



### v0.2.1：水印要能真的看见

  * **v0.2.1** 修复水印渲染：在部分环境下 `PingFang.ttc` 无法被 Pillow 正常加载会导致中文不显示，改为 `STHeiti Medium.ttc` 叠字并加大字号，保证右下角水印可读。



### v0.3.0：三篇真实文章对比图进仓库

  * **v0.3.0** 新增 `examples/` 三张「原文摘录 vs 漫画」对比 PNG；附 `SOURCES.md` 与可复现脚本 `scripts/build_article_comic_examples.py`。



### v0.3.1：原文出处改为公众号官方链接

  * **v0.3.1**` SOURCES.md` 与本文下方「原文官方链接」均改为 mp 正式 URL，不再写本地路径。



### v0.5.1：严格按 skill SOP 重跑示例

  * **v0.5.1** 24 张分镜按「串行调用 + 5-6 秒间隔 + scene_*.json+png 成对输出」重跑，本文链接切换到 `outputs/comic` 严格产物。



### v0.5.0：四篇文章升级为深度分镜

  * **v0.4.0** 四篇文章不再仅用1张图，每篇扩展为6张连续分镜（共24张），并同步更新仓库与本文展示。



## 五、适合谁

  * 要把长文改成小红书/微博九宫格的人
  * 希望“一图一观点”，而不是一张海报糊满字的人
  * 已经在用 OpenClaw / Agent Skill，想把出图流程固化的人
  * 愿意自己配置图像 API，只要稳定流水线的人



文章不会自动变短，但可以被切成读者愿意看完的一串画面。仓库再贴一次：https://github.com/sgsss998/article-to-comic.skill

本文涉及开源仓库：article-to-comic.skill

公众号：AI干货家老明 ｜ 转载请联系授权
