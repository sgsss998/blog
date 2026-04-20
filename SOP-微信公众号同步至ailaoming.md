# SOP：微信公众号全文同步至 ailaoming.com

> **最后更新**：2026-04-20  
> **适用**：本目录 Astro 博客（部署仓库 `https://github.com/sgsss998/blog`）

---

## 1. 目标与链路

- **目标**：把已发公众号文章以**正文完整 + 配图齐全**的形式同步到个人站 **https://ailaoming.com**，列表与详情展示正常。
- **上线链路**：本地/本机维护 `06-归档/blog` → **`git push origin master`** → **Vercel** 构建 →域名 **ailaoming.com** 更新（通常一两分钟）。

不在此文档内维护服务器 SSH/rsync；个人站由 **Git 仓库 + Vercel** 驱动。

---

## 2. 工作目录与仓库

| 项目 | 值 |
|------|-----|
| 本地路径 | `AI分身专用工作区/03-内容创作/公众号-AI干货家老明/06-归档/blog` |
| 远程仓库 | `https://github.com/sgsss998/blog.git` |
| 分支 | `master` |

历史对话里可能出现短路径 `.../公众号-AI干货家老明/blog`，与当前 **`06-归档/blog`** 为同一套仓库，以磁盘上 **`06-归档/blog`** 为准。

---

## 3. 环境要求

- **Astro 构建**：Node **≥ 22.12**（与 `package.json` / Astro 要求一致）。本机常用：
  ```bash
  export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
  cd "/Volumes/T7/Super_Knowledge_Base/AI分身专用工作区/03-内容创作/公众号-AI干货家老明/06-归档/blog"
  npm run build
  ```
- **微信全文抓取脚本**：Python 3，依赖见下文；建议在仓库内虚拟环境执行，避免污染系统 Python：
  ```bash
  cd ".../06-归档/blog"
  python3 -m venv .venv-wechat
  . .venv-wechat/bin/activate
  pip install beautifulsoup4 lxml html2text requests
  ```
  `.venv-wechat/` 已写入 `.gitignore`，勿提交。

---

## 4. 全文抓取（禁止只用摘要）

原则：**从微信文章页拉取 `#js_content` 静态 HTML**，下载 `mmbiz` 配图到 `public/images/blog/`，再生成/覆盖 `src/content/blog/{slug}.md`。不要用自写摘要代替正文。

### 4.1 脚本位置与配置

- 脚本：`scripts/fetch_wechat_full.py`
- 在文件内维护 **`ARTICLES`**：`(slug,微信短链 id)`，例如 `("scold-ai-rl-de-ai-flavor-compare", "NmFn-U2RbCsS4L4J3p5q9w")`，完整 URL 为 `https://mp.weixin.qq.com/s/{id}`。

### 4.2 抓取路径优先级（新增）

遇到公众号链接时，按以下优先级执行：

1. **路径 A（优先）**：`WebFetch` 直接抓取正文（适合绕过部分“环境异常”场景）。  
2. **路径 B（回退）**：`scripts/fetch_wechat_full.py`（requests + bs4 + html2text）。  
3. **路径 C（兜底）**：用户提供可访问正文源（复制文本/导出 md/截图+原图包），再按本站规范落盘。

执行要求：

- 只要 A 成功拿到全文，优先用 A 落盘；
- A 失败再走 B，不要在 B 死循环重试；
- A/B 都失败时立即走 C，并在提交信息里标明“来源方式（用户提供）”。

### 4.3 路径 A：WebFetch 执行规范（新增）

#### 4.3.1 抓取与判定

- 对每个微信链接调用 `WebFetch(url)`。
- 若返回包含「环境异常 / 去验证 / 当前环境异常」等阻断词，判定失败，切回路径 B。
- 若返回正文，必须确认：
  - 有明确标题；
  - 有连续正文段落（不是仅一句导语）；
  - 不是“小说阅读器跳转提示”这类空壳页。

#### 4.3.2 落盘格式

- 新建或更新：`src/content/blog/{slug}.md`
- frontmatter 至少包含：`title`、`description`、`pubDate`、`keywords`
- 开头保留：
  - `> **原文首发**：[微信公众号](原链接)`

### 4.4 图片处理规范（重点新增）

无论走路径 A 还是 B，**图片都必须同步到站点**，不得只留外链。

#### 4.4.1 图片来源优先级

1. 正文中可直接提取的 `mmbiz.qpic.cn` 图片 URL（`data-src` / `src`）；
2. 若 WebFetch 结果未给出可下载 URL，则：
   - 用回退脚本从原页面抓图，或
   - 由用户提供原图文件包（兜底）。

#### 4.4.2 本地命名与路径

- 图片统一落盘到：`public/images/blog/`
- 命名规范：`{slug}-wechat-{序号}.{ext}`
- 文内引用必须替换为本地路径：`/images/blog/{filename}`
- **禁止**在最终 md 中保留 `mmbiz.qpic.cn` 外链

#### 4.4.3 封面图规则

- 有图文章必须写 `heroImage`（首张图或主视觉图）
- `heroImage` 指向本地路径，如：`/images/blog/{slug}-wechat-01.png`

### 4.5 路径 B：脚本执行（原 4.2）

```bash
cd ".../06-归档/blog"
. .venv-wechat/bin/activate
python scripts/fetch_wechat_full.py
```

脚本行为概要：

- 请求 `mp.weixin.qq.com/s/...`，解析 **`#js_content`**；
- 图片使用 **`data-src` / `src`** 中的 `mmbiz.qpic.cn` 地址，**Referer** 为 `https://mp.weixin.qq.com/`；
- 图片保存为 `public/images/blog/{slug}-wechat-{序号}.{ext}`，文中引用 `/images/blog/...`；
- 保留原文章已有 frontmatter 中的 **`pubDate`、`keywords`**（若文件已存在），**标题**以微信页 `h1#activity-name` 为准；
- 有图时写入 **`heroImage`**（首张图），供列表与详情头图使用。

正文为 **HTML → Markdown（html2text）**，个别段落与图片可能挤在同一行，如需版式可再人工或加后处理断行。

### 4.6 构建与图片完整性校验（升级）

```bash
nvm use 22   # 或等价方式
npm run build
```

通过后再提交。并额外做图片检查：

1. 抽查新增文章 md：确认至少有 `heroImage` 或文中图片链接；  
2. 确认 `public/images/blog/` 下存在对应文件；  
3. 随机打开 1-2 篇新增文章的 `dist/blog/{slug}/index.html`，检查图片 src 为 `/images/blog/...` 本地路径。

---

## 5. Git 提交与推送（触发 Vercel）

在 `06-归档/blog` 根目录：

```bash
git add src/content/blog/ public/images/blog/ scripts/ .gitignore src/consts.ts src/layouts/ src/pages/   # 按实际改动增减
git status
git commit --trailer "Made-with: Cursor" -m "简述：本次同步或修复要点"
git push origin master
```

- 提交说明写清：**新增/更新篇目、是否跑过抓取脚本、是否改样式**等，便于回溯。
- 推送成功后到 Vercel 看构建是否绿；站点路径一般为 **`/blog/{slug}/`**。

---

## 6. 封面图（与微信公众号头条一致）

微信公众号**头条封面**常用规范：**900 × 383 像素（约 2.35:1）**；列表小图多取中部区域，站点侧用 **`object-fit: cover` + `object-position: center`** 接近后台裁切观感。

本仓库约定：

| 位置 | 作用 |
|------|------|
| `src/consts.ts` | `WECHAT_COVER_WIDTH = 900`、`WECHAT_COVER_HEIGHT = 383` |
| `src/pages/blog/index.astro` | 列表 `Image` 使用上述宽高，外包 `.cover`，`aspect-ratio: 900 / 383` |
| `src/layouts/BlogPost.astro` | 文章页 `.hero-image` 同比例，`max-width: 900px`，头图 `cover + center` |

**`heroImage`** 在 frontmatter 中指向 `/images/blog/...`，与抓取脚本首张图一致。

---

## 7. 实施检查清单（每次同步可过一遍）

1. [ ] 在 `fetch_wechat_full.py` 的 `ARTICLES` 中登记/更新 slug 与微信 id  
2. [ ] 先尝试 `WebFetch`，失败再走脚本回退  
3. [ ] 正文为全文（非摘要），并保留原文链接  
4. [ ] 图片已本地化到 `public/images/blog/`（无微信外链残留）  
5. [ ] `heroImage` 已配置（有图文章）  
6. [ ] `nvm use 22` 后 `npm run build` 通过  
7. [ ] `git add` 包含对应 `.md`、`public/images/blog/` 下新图及必要代码  
8. [ ] `git commit` + `git push origin master`  
9. [ ] Vercel 构建成功，ailaoming.com 抽查文章与头图比例  

---

## 8. 相关文件索引

- Astro 站点配置：`astro.config.mjs`（`site: https://ailaoming.com`）  
- 博客内容：`src/content/blog/*.md`  
- 静态图：`public/images/blog/`  
- 微信抓取：`scripts/fetch_wechat_full.py`  

---

若后续改为其他托管方式，在本文件「§1 目标与链路」中替换为实际步骤即可。
