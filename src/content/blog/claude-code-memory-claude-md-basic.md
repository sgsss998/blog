---
title: "如何让 claude code 每次重启后都具有记忆：一个超简单方法（基础版）"
description: "Claude Code 记忆系统部署指南：通过 CLAUDE.md 实现重启后记忆复用的基础方法。"
pubDate: 2026-04-20
keywords: ["Claude Code", "CLAUDE.md", "记忆", "SOP", "AI工具"]
heroImage: "/images/blog/claude-code-memory-claude-md-basic-wechat-01.jpg"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/FLZelyg2qev3tDEDh_wWjA)

![](/images/blog/claude-code-memory-claude-md-basic-wechat-01.jpg)

![](/images/blog/claude-code-memory-claude-md-basic-wechat-02.png)

![](/images/blog/claude-code-memory-claude-md-basic-wechat-03.png)

Claude Code 记忆系统部署指南

让 Claude 每次对话都“记得”你是谁、你的项目、你的偏好。

## 核心原理

Claude Code 本身没有跨对话记忆。但它支持在项目根目录放一个 `CLAUDE.md` 文件，每次新对话启动时自动加载到上下文中。相当于给 AI 注入了一份“个人档案”。

## 一、最简单的方式：CLAUDE.md

### 步骤

1. 打开终端，进入你的项目目录
2. 创建 `CLAUDE.md` 文件
3. 写入你想让 Claude 记住的内容

## 二、进阶：分层记忆

如果你有多个项目、多个身份，可以分层管理。Claude 会叠加加载：先加载全局，再加载项目级。

## 三、CLAUDE.md 写什么？

按需填写，不需要全抄。核心原则：写那些每次都要重复告诉 AI 的信息。

### 推荐内容

- 身份信息
- 项目背景
- 编码规范
- 沟通偏好
- 常用命令
- 禁止事项

### 不用写的内容

- 每次都会变的临时信息
- 已经写在代码注释里的东西
- 过于冗长的文档（会占上下文窗口）

## 五、部署到其他电脑

`CLAUDE.md` 就是一个普通文件，同步方式随你：

- Git 同步（推荐）：提交到仓库，clone 后自动生效
- 手动复制：拷贝文件到对应目录
- 云同步：国产云盘等

## 总结

1. 在项目根目录创建 `CLAUDE.md`
2. 写入你想让 AI 记住的信息
3. 保存，下次对话自动生效

就这么简单。不需要配置、不需要插件、不需要 API。文件在，记忆就在。
