---
title: "如何优雅地让 AI 编辑 Word 文档"
description: "一套保住 Word 版式的实操 SOP：复制母版、run 级改写、跨 run 替换、表格同步、交付前自检。"
pubDate: 2026-04-20
keywords: ["Word", "AI", "python-docx", "SOP", "排版"]
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/Dv0NVgms6t9-smKIduUNxg)

让 AI 改 Word 时，最常见问题不是内容，而是版式：字体乱、段距飘、页眉页脚不一致、AI 痕迹重。  
本文核心观点：**先复制格式母版，再在副本里做 run 级改写**，避免整段覆盖导致样式损毁。

## 关键结论（原文核心）

- `.docx` 不是一串文本，而是 OOXML 结构（段落 `w:p`、运行 `w:r`、样式属性 `rPr/pPr`）。
- `paragraph.text = ...` 往往会重建 run，导致东亚字体、局部加粗、混排信息丢失。
- `Document()` 从零生成作为主交付，容易回落到默认样式（常见 Calibri 风格漂移）。
- 只遍历正文段落不够，**表格**必须同步处理。

## 可执行 SOP（简版）

1. 复制母版：

```python
import shutil
from docx import Document
shutil.copy("格式母版.docx", "输出-副本.docx")
doc = Document("输出-副本.docx")
```

2. 优先 run 级替换：

```python
for run in paragraph.runs:
    if old in run.text:
        run.text = run.text.replace(old, new)
```

3. 整段重写时保首 run：

```python
def rewrite_paragraph(paragraph, new_text):
    if paragraph.runs:
        paragraph.runs[0].text = new_text
        for run in paragraph.runs[1:]:
            run.text = ""
```

4. 新增段落优先 `deepcopy` 母版段/母版 run，不要盲目 `add_paragraph()`  
5. 同步遍历 `doc.tables`  
6. 交付前做残留词、样式、表格更新自检

## 与内容写作规则的边界

- 版式稳定：靠母版 + run 级编辑
- 去 AI 味、事实准确：靠写作规范与人工复核

## 结语

多数“AI 改 Word 不像人写的”问题，本质是结构被破坏而不是语言错误。  
沿着“复制母版 -> run 级手术”的路径，能显著减少返工。

