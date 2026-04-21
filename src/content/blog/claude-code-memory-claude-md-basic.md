---
title: "如何让 claude code 每次重启后都具有记忆：一个超简单方法（基础版）"
description: "claude code 的基础设定是每次重启终端记忆即清零，不具备记忆复用的能力。这一点很恼人——明明 claude code 那么强大，但偏偏每次重启终端后都会断片，还得重新喂给他记忆，他才能重新上手干活，这极大的增加了沟通时间成本。 所以，我模仿小龙虾的记忆架构，给 claude code 搭建了一个简单的记忆复用功能： 原理非常简单，Claude Code 本身没有跨对话记忆，但它支持在项目根目录放一个 CLAUDE.md 文件…"
pubDate: 2026-04-20
keywords: ["Claude Code", "CLAUDE.md", "记忆", "SOP", "AI工具"]
heroImage: "/images/blog/claude-code-memory-claude-md-basic-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/FLZelyg2qev3tDEDh_wWjA)
claude code 的基础设定是每次重启终端记忆即清零，不具备记忆复用的能力。这一点很恼人——明明 claude code 那么强大，但偏偏每次重启终端后都会断片，还得重新喂给他记忆，他才能重新上手干活，这极大的增加了沟通时间成本。所以，我模仿小龙虾的记忆架构，给 claude code 搭建了一个简单的记忆复用功能：![](/images/blog/claude-code-memory-claude-md-basic-wechat-01.png)![](/images/blog/claude-code-memory-claude-md-basic-wechat-02.png)原理非常简单，Claude Code 本身没有跨对话记忆，但它支持在项目根目录放一个 `CLAUDE.md` 文件，**每次新对话启动时自动加载到上下文中** 。相当于给 AI 强行注入一份记忆档案。具体的部署方法，因为我讲的不如 cc 专业，所以我就让 claude code 自己写了一份细颗粒度的操作指南，分享如下，可以直接复制粘贴给你的 claude code，让他自己部署完成：

#   


* * *

#   


# Claude Code 记忆系统部署指南

> 让 Claude 每次对话都"记得"你是谁、你的项目、你的偏好。

* * *

## 核心原理

Claude Code 本身没有跨对话记忆。但它支持在项目根目录放一个 `CLAUDE.md` 文件，**每次新对话启动时自动加载到上下文中** 。相当于给 AI 注入了一份"个人档案"。

* * *

## 一、最简单的方式：CLAUDE.md

### 步骤

  


  1. 打开终端，进入你的项目目录  


  2. 创建 `CLAUDE.md` 文件：




  *   * 

    
    
    claude  # 启动 Claude Code   # 在对话中直接说："帮我创建 CLAUDE.md，内容如下：..."
    
    
      
    

3.写入你想让 Claude 记住的内容，比如：

  *   *   *   *   *   *   *   *   *   *   *   * 

    
    
    基础记忆我是谁姓名：张三职业：前端工程师技术栈：React、TypeScript、Node.js项目背景当前项目：XXX管理系统代码风格：使用 ESLint + Prettier，2空格缩进偏好中文回复简洁直接，不要废话不要自动添加注释

4.保存，完成。以后每次在这个目录下启动 Claude Code，它都会自动读取。

### 位置规则

文件位置| 作用范围  
---|---  
项目根目录 `CLAUDE.md`| 当前项目生效，可提交到 Git  
`~/.claude/CLAUDE.md`| 全局生效，所有项目都会加载  
  
* * *

## 二、进阶：分层记忆

如果你有多个项目、多个身份，可以分层管理：
    
    
    ~/.claude/CLAUDE.md              ← 全局（所有项目共享）  
    ~/project-a/CLAUDE.md            ← 项目A专用  
    ~/project-b/CLAUDE.md            ← 项目B专用  
    

Claude 会**叠加加载** ：先加载全局，再加载项目级。

* * *

## 三、CLAUDE.md 写什么？

按需填写，不需要全抄。核心原则：**写那些每次都要重复告诉 AI 的信息** 。

### 推荐内容

类别| 示例  
---|---  
**身份信息**|  姓名、职业、技术背景  
**项目背景**|  项目是做什么的、技术栈、目录结构  
**编码规范**|  代码风格、命名规则、用 Tab 还是空格  
**沟通偏好**|  语言、简洁程度、要不要解释代码  
**常用命令**|  构建命令、测试命令、部署流程  
**禁止事项**|  不要做什么（比如不要自动 commit）  
  
### 不用写的内容

  * 每次都会变的临时信息
  * 已经写在代码注释里的东西
  * 过于冗长的文档（会占上下文窗口）



* * *

## 四、实际操作示例

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 

    
    
    场景1：个人开发者# 记忆## 基本信息- 叫我小明- 全栈开发者，主力 Python + Vue- 中文沟通## 项目- 这是一个博客系统，后端 FastAPI，前端 Vue3- 数据库用 PostgreSQL- 运行项目：`docker-compose up`## 规则- 代码用中文注释- commit message 用英文- 改完代码自动跑测试场景2：团队项目# 项目规范## 技术栈- 前端：React 18 + TypeScript + Tailwind- 后端：Go + Gin + GORM- 数据库：MySQL 8.0## 代码规范- 组件用函数式组件 + Hooks- API 响应统一用 `{ code, data, message }` 格式- 错误处理用中间件统一捕获## 常用命令- 启动开发：`pnpm dev`- 运行测试：`pnpm test`- 代码检查：`pnpm lint`
    
    
      
    
    
    
      
    

* * *

## 五、部署到其他电脑

`CLAUDE.md` 就是一个普通文件，同步方式随你：

  * **Git 同步** （推荐）：提交到仓库，clone 后自动生效
  * **手动复制** 拷贝文件到对应目录
  * **云同步** 国产云盘等等



* * *

## 总结
    
    
    1. 在项目根目录创建 CLAUDE.md  
    2. 写入你想让 AI 记住的信息  
    3. 保存，下次对话自动生效  
    

就这么简单。不需要配置、不需要插件、不需要 API。文件在，记忆就在。
