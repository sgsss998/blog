# SOP：微信公众号全文同步至 ailaoming.com

> **最后更新**：2026-04-21  
> **适用**：本目录 Astro 博客（部署仓库 `https://github.com/sgsss998/blog`）  
> **操作母版**：从登记文章到推送上线的**逐步命令**以 **4.7 标准执行顺序** 为准；决策与探针以 **4.2** 为准。

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

### 4.2 抓取路径优先级（与 2026-04-21 实践对齐）

**结论：以路径 B 为默认主路径**（`fetch_wechat_full.py` 拉 `#js_content` + 全量下图片）。该方式在「本机直连微信页可返回正文 HTML」时**可完全复现、图文与微信 DOM 一致**，也是四篇重同步时实际采用且验收通过的方式。

遇到公众号链接时，按以下顺序决策：

1. **路径 B（主路径，推荐）**：`scripts/fetch_wechat_full.py`（`requests` + BeautifulSoup + `html2text`）。  
   - 适用：本机请求 `https://mp.weixin.qq.com/s/{id}` 返回的 HTML 中**存在** `#js_content` 且**非**「环境异常」整页拦截。  
   - **禁止**：在明知 `#js_content` 缺失或只有拦截页时，仍把 WebFetch 的节选/二次排版稿当「全文」落盘。
2. **路径 A（补充尝试）**：`WebFetch(url)` 或其它可读通道。  
   - 适用：路径 B 因「环境异常」等拿不到 `#js_content` 时；或需人工快速核对标题/开头段落。  
   - **注意**：WebFetch 结果常**不含可下载的 mmbiz 原图 URL**，此时仍须回到路径 B 下图片，或走路径 C 补图；**不得**只落文字、不留本地化配图。
3. **路径 C（兜底）**：用户提供可访问正文源（复制全文 / 导出 md / 原图包），再按本站规范手写或半自动落盘；`git commit` 说明中注明来源为用户提供。

**执行要求（硬性）**

- 每次开抓前先做 **4.2.1 环境探针**（约 10 秒），确认再走路径 B；不要盲跑脚本后才发现全是拦截页。  
- 路径 B 成功则**以脚本输出为唯一正文来源**（含 `html2text` 转换结果），不要用大模型「润色」「缩写」替换正文。  
- 路径 B 与 A 都失败 → 立刻走路径 C，**不要**编造摘要充数。

#### 4.2.1 环境探针（抓取前必做）

在已激活 `.venv-wechat` 的同一环境下执行，将 `ARTICLE_ID` 换成微信 URL 中 `/s/` 后的 id：

```bash
cd "/Volumes/T7/Super_Knowledge_Base/AI分身专用工作区/03-内容创作/公众号-AI干货家老明/06-归档/blog"
. .venv-wechat/bin/activate
python - <<'PY'
import requests
from bs4 import BeautifulSoup
ARTICLE_ID = "xxxxxxxxxxxx"  # 替换为真实 id
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
url = f"https://mp.weixin.qq.com/s/{ARTICLE_ID}"
r = requests.get(url, headers={"User-Agent": UA}, timeout=90)
soup = BeautifulSoup(r.text, "lxml")
title = soup.select_one("#activity-name")
content = soup.select_one("#js_content")
blocked = "环境异常" in r.text
print("blocked_like=", blocked, "title=", bool(title), "js_content=", bool(content), "html_len=", len(r.text))
PY
```

**判定**：`js_content=True` 且整页非明显拦截 → 本机可走路径 B，执行 **4.7 标准执行顺序**。`js_content=False` 或 `blocked_like=True` → 不要强行认为脚本会成功；转 **路径 A / C**。

#### 4.2.2 路径 B 脚本约定（与仓库实现一致）

- **UA**：与 `fetch_wechat_full.py` 内 `UA` 常量一致（桌面 Chrome 串）。  
- **图片请求头**：下载图片时 `Referer: https://mp.weixin.qq.com/`（脚本内 `HEADERS_IMG`）。  
- **识别配图**：仅处理 `#js_content` 内 `<img>` 的 `data-src` 或 `src`，且 URL 中含 **`mmbiz`** 子串的地址（含 `sz_mmbiz_*` 等变体）。  
- **扩展名**：由 URL 中 `wx_fmt=` 推断，脚本支持 `jpeg` / `jpg` / `png` / `gif` / **`webp`**。  
- **覆盖策略**：每次对某 slug 跑抓取时，**按当前 DOM 顺序重新编号并重新下载**，覆盖 `public/images/blog/{slug}-wechat-{NN}.{ext}`；避免「文件已存在就跳过下载」导致旧图残留。  
- **元数据保留**：若目标 `src/content/blog/{slug}.md` 已存在，脚本保留其 **`pubDate`、`keywords`**，**标题**以微信页 `#activity-name` 为准重写；**`description`** 由正文 HTML 自动生成摘要。

### 4.3 路径 A：WebFetch 执行规范（补充）

#### 4.3.1 抓取与判定

- 在**路径 B 不可用**（探针无 `#js_content`）或仅需**人工核对标题/开头**时使用；**能走路径 B 时不必先走 WebFetch**。
- 对每个微信链接调用 `WebFetch(url)`。
- 若返回包含「环境异常 / 去验证 / 当前环境异常」等阻断词，判定失败，转路径 B（若此时本机已可直连）或路径 C。
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

### 4.5 路径 B：脚本执行（主路径）

```bash
cd ".../06-归档/blog"
. .venv-wechat/bin/activate
python scripts/fetch_wechat_full.py
# 仅重拉已在 ARTICLES 中登记的若干篇（slug 与脚本内元组第一项一致）
python scripts/fetch_wechat_full.py --only slug-a slug-b
```

**与 4.7 的关系**：日常同步请直接按 **4.7** 执行；本节为命令与行为速查。

脚本行为概要：

- 请求 `mp.weixin.qq.com/s/...`，解析 **`#js_content`**；
- 图片使用 **`data-src` / `src`** 中的 `mmbiz.qpic.cn` 地址，**Referer** 为 `https://mp.weixin.qq.com/`；
- 图片保存为 `public/images/blog/{slug}-wechat-{序号}.{ext}`，文中引用 `/images/blog/...`；
- 保留原文章已有 frontmatter 中的 **`pubDate`、`keywords`**（若文件已存在），**标题**以微信页 `h1#activity-name` 为准；
- 有图时写入 **`heroImage`**（首张图），供列表与详情头图使用。
- 每次抓取会**重新下载**当前序号下的配图并覆盖同名文件，避免沿用过期缓存。

正文为 **HTML → Markdown（html2text）**，个别段落与图片可能挤在同一行，如需版式可再人工或加后处理断行。

### 4.6 构建与图片完整性校验（升级）

**顺序**：与 **4.7** 一致——**先** `validate_wechat_sync.py`（或 `npm run validate:wechat`），**再** `npm run build`，**最后** `git commit` / `push`。

全站校验：

```bash
npm run validate:wechat
```

仅校验本次改动篇目（推荐）：

```bash
python3 scripts/validate_wechat_sync.py --slugs slug-a slug-b
```

校验项（硬性，与 `scripts/validate_wechat_sync.py` 实现一致）：

- 有 `原文首发` 且含 `mp.weixin.qq.com`；
- 无 `mmbiz.qpic.cn` 残留外链；
- `heroImage` 存在且文件落地；
- 正文图片全部是站内路径且文件存在；
- 正文长度不过短（防摘要化落盘）。

验收通过后构建：

```bash
nvm use 22   # 或等价方式
npm run build
```

构建通过后、提交前，建议额外抽查：

1. 新增/更新文章 md：存在 `heroImage` 且正文含 `![](/images/blog/...)`（有图文章）；  
2. `public/images/blog/` 下对应文件存在；  
3. 打开 `dist/blog/{slug}/index.html`，确认 `<img src="/images/blog/...">` 无外链图。

### 4.7 标准执行顺序（下次原样照抄）

以下顺序**不得调换**：先落盘与验收，再构建，最后推送。路径变量请按本机磁盘修改；下例与 **2026-04-21 四篇重同步** 所用一致。

**（1）进入目录并激活虚拟环境**

```bash
cd "/Volumes/T7/Super_Knowledge_Base/AI分身专用工作区/03-内容创作/公众号-AI干货家老明/06-归档/blog"
. .venv-wechat/bin/activate
```

**（2）登记文章**：编辑 `scripts/fetch_wechat_full.py` 顶部列表 **`ARTICLES`**，每项为  
`( "站点 slug", "微信文章 id" )`，其中 id 为链接 `https://mp.weixin.qq.com/s/{id}` 中 **`/s/` 后整段**（区分大小写，勿截断）。

**（3）环境探针**：对**每一篇**新 id 执行 **4.2.1**，确认 `js_content=True` 再走下一步。

**（4）仅抓取本次篇目（推荐，避免误改其它已同步文章）**

```bash
python scripts/fetch_wechat_full.py --only slug-1 slug-2
```

- `--only` 后的 slug 必须**已出现在 `ARTICLES` 中**；若写错 slug，脚本会以非零退出码报错并提示未知 slug。  
- 若本次确需全量重拉库内已登记的全部文章，则执行不带参数的：  
  `python scripts/fetch_wechat_full.py`  
  （慎用，耗时长且会覆盖多篇 md/图。）

**（5）脚本成功输出**：终端应出现类似  
`OK {slug}: title='…' images=N -> src/content/blog/{slug}.md`  
请核对 **`images=N`** 是否符合预期（与微信内长图、对比图数量大致一致）；`N=0` 时须停手排查 DOM 或拦截页。

**（6）清理孤儿资源（按需）**  
若同一 slug 曾用旧版抓取过，仓库里可能残留 **`{slug}-wechat-xx.jpg`** 等**已不再被当前 md 引用**的文件。发布前可对照 md 内 `![](/images/blog/...)` 与 `heroImage`，删除无引用文件，避免仓库膨胀与混淆（非强制，但推荐）。

**（7）自动验收（本次改动篇目）**

```bash
python3 scripts/validate_wechat_sync.py --slugs slug-1 slug-2
```

或校验全站：

```bash
npm run validate:wechat
```

**（8）生产构建**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
npm run build
```

**（9）提交并推送**（见第 5 节）：`git add` 须包含本次变更的 **`src/content/blog/*.md`**、**`public/images/blog/`** 下对应图片、以及若改动过的 **`scripts/`**、**本 SOP** 等；`git push origin master` 后等待 Vercel 绿勾，再在 **https://ailaoming.com/blog/{slug}/** 抽查正文与配图。

---

## 5. Git 提交与推送（触发 Vercel）

在 `06-归档/blog` 根目录（**须在 4.7 中校验与 build 均通过之后**）：

```bash
git add src/content/blog/ public/images/blog/ scripts/ SOP-微信公众号同步至ailaoming.md .gitignore src/consts.ts src/layouts/ src/pages/   # 按实际改动增减
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

## 7. 实施检查清单（与 4.7 一致，可逐项打勾）

1. [ ] 已在 `scripts/fetch_wechat_full.py` 的 **`ARTICLES`** 中登记 `(slug, 微信id)`，且 slug 与目标文件名一致  
2. [ ] 已对**每个**新微信 id 执行 **4.2.1 环境探针**，确认 `js_content=True` 再抓取（否则已转路径 A/C，不在此清单假装完成）  
3. [ ] 已执行 `python scripts/fetch_wechat_full.py --only ...`（或经评估后全量脚本），终端 **`OK ... images=N`** 中 `N` 合理  
4. [ ] 正文为脚本自 `#js_content` 转换的全文（非摘要、非模型改写），且含 **`原文首发`** 微信链接  
5. [ ] 图片已本地化到 `public/images/blog/`，md 内无 `mmbiz.qpic.cn`；**按需**删除本次 slug 下不再被引用的旧图文件  
6. [ ] `heroImage` 已存在且路径可访问（有图文章）  
7. [ ] 已运行 `python3 scripts/validate_wechat_sync.py --slugs ...` 或 `npm run validate:wechat`，**全部通过**  
8. [ ] 已在 `nvm use 22` 下执行 `npm run build` 且成功  
9. [ ] `git add` 含本次 `.md`、`public/images/blog/`、`scripts/`、本 SOP 等实际改动；`git commit` + `git push origin master`  
10. [ ] Vercel 构建成功；**https://ailaoming.com/blog/{slug}/** 抽查正文、配图与头图比例  

---

## 8. 相关文件索引

- Astro 站点配置：`astro.config.mjs`（`site: https://ailaoming.com`）  
- 博客内容：`src/content/blog/*.md`  
- 静态图：`public/images/blog/`  
- 微信抓取：`scripts/fetch_wechat_full.py`  
- 自动验收：`scripts/validate_wechat_sync.py`  

---

若后续改为其他托管方式，在本文件「第 1 节 目标与链路」中替换为实际步骤即可。
