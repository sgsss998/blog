---
title: "如何优雅的让 AI 编辑 word 文档"
description: "AI 编辑 Word 的保版式 SOP：复制母版、run 级改写、跨 run 替换与表格同步。"
pubDate: 2026-04-20
keywords: ["Word", "AI", "python-docx", "SOP", "排版"]
heroImage: "/images/blog/ai-word-edit-sop-elegant-wechat-01.jpg"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/Dv0NVgms6t9-smKIduUNxg)

![](/images/blog/ai-word-edit-sop-elegant-wechat-01.jpg)

AI 帮你改 Word，为什么总是一改就「不像人写的」？一份保住 99% 版式的 SOP

适合：经常用 AI 生成/改写 Word、却被字体行距页眉页脚折磨的朋友。

## 一、根因：Word 不是「一串字」，而是一棵树

很多人把 `.docx` 当成「带格式的 txt」，但 Word 内部是 OOXML：段落（w:p）下面挂着多个运行（w:r），每个 run 都有自己的 rPr（run 属性）。

## 二、心法（只要记住这一句）

先复制你的「格式母版」`.docx`，再在副本上改「run 里的字」。

## 三、可执行 SOP（按优先级）

1）起手式：复制原档

2）替换：优先在「单个 run」里 replace

3）进阶：跨 run 替换

4）整段重写：保留「第一个 run」的格式 DNA

5）插入新段：不要迷信 `add_paragraph()`

6）表格别忘

7）交付前自检

## 五、对比示例

![](/images/blog/ai-word-edit-sop-elegant-wechat-02.png)

![](/images/blog/ai-word-edit-sop-elegant-wechat-03.png)

## 结语

AI 写 Word 让人抓狂，多半不是模型不行，而是工具链把结构拆坏了。
