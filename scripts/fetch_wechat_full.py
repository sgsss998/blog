#!/usr/bin/env python3
"""Fetch full WeChat mp article HTML (#js_content), download images, emit Markdown with frontmatter."""

from __future__ import annotations

import ast
import html as html_lib
import json
import re
from pathlib import Path

import html2text
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BLOG_MD = ROOT / "src/content/blog"
PUBLIC_IMG = ROOT / "public/images/blog"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
HEADERS_IMG = {"User-Agent": UA, "Referer": "https://mp.weixin.qq.com/"}

ARTICLES: list[tuple[str, str]] = [
    ("scold-ai-rl-de-ai-flavor-compare", "NmFn-U2RbCsS4L4J3p5q9w"),
    ("de-ai-flavor-writing-skill-sop", "q-nZ4yni_Z1oUkZ0y85xnA"),
    ("admit-poor-and-hustle-2026", "UYXgXimSOU7z709wujBmfQ"),
    ("recommend-frontend-slides-skill", "srs-88u46u15djejN8jiTw"),
    ("wechat-ledger-automation", "XJsKTh-8_etG_rgLJRed4g"),
    ("ai-era-liberal-arts-myth", "zoG31kifchxAizD5dSbpAA"),
    ("ai-money-series-01-reimburse-skill", "sAApNn-43g1Ih2cS1OwwUw"),
    ("ai-money-series-02-tomato-novel", "P3X5VmCC-Zyv2AghvF1UGQ"),
    ("plain-prompt-export-ai-memories", "C8LBrGelkf6krJkUPURZkQ"),
    ("claude-code-mac-glm-2026", "P3St1vufT6Yw2IZamxq2jg"),
]


def ext_from_url(url: str) -> str:
    u = url.lower()
    if "wx_fmt=gif" in u:
        return "gif"
    if "wx_fmt=png" in u:
        return "png"
    if "wx_fmt=jpeg" in u or "wx_fmt=jpg" in u:
        return "jpg"
    return "jpg"


def plain_summary(html_fragment: str, max_len: int = 220) -> str:
    soup = BeautifulSoup(html_fragment, "lxml")
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"


def download_image(session: requests.Session, url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = session.get(url, headers=HEADERS_IMG, timeout=120)
    r.raise_for_status()
    dest.write_bytes(r.content)


def html_to_md(html_fragment: str) -> str:
    h = html2text.HTML2Text()
    h.body_width = 0
    h.ignore_links = False
    h.ignore_images = False
    h.single_line_break = False
    return h.handle(html_fragment).strip()


def load_prev_meta(md_path: Path) -> tuple[str, list[str]]:
    if not md_path.exists():
        return "2026-04-01", []
    raw = md_path.read_text(encoding="utf-8")
    pub_m = re.search(r"^pubDate:\s*(.+)\s*$", raw, re.M)
    pub = pub_m.group(1).strip() if pub_m else "2026-04-01"
    kw_m = re.search(r"^keywords:\s*(\[.*\])\s*$", raw, re.M)
    if not kw_m:
        return pub, []
    try:
        kw = ast.literal_eval(kw_m.group(1))
        if isinstance(kw, list):
            return pub, [str(x) for x in kw]
    except (SyntaxError, ValueError):
        pass
    return pub, []


def build_frontmatter(
    title: str,
    description: str,
    pub_date: str,
    keywords: list[str],
    hero: str | None,
    source_url: str,
) -> str:
    lines = [
        "---",
        f"title: {json.dumps(title, ensure_ascii=False)}",
        f"description: {json.dumps(description, ensure_ascii=False)}",
        f"pubDate: {pub_date}",
        f"keywords: {json.dumps(keywords, ensure_ascii=False)}",
    ]
    if hero:
        lines.append(f"heroImage: {json.dumps(hero, ensure_ascii=False)}")
    lines.append("---")
    lines.append("")
    lines.append(f"> **原文首发**：[微信公众号]({source_url})")
    lines.append("")
    return "\n".join(lines)


def process_one(session: requests.Session, slug: str, article_id: str) -> None:
    url = f"https://mp.weixin.qq.com/s/{article_id}"
    r = session.get(url, headers={"User-Agent": UA}, timeout=90)
    r.raise_for_status()
    r.encoding = r.apparent_encoding or "utf-8"
    soup = BeautifulSoup(r.text, "lxml")

    title_el = soup.select_one("#activity-name")
    title_txt = title_el.get_text(strip=True) if title_el else slug
    content_el = soup.select_one("#js_content")
    if not content_el:
        raise RuntimeError(f"No #js_content for {slug}")

    md_path = BLOG_MD / f"{slug}.md"
    pub_date, keywords = load_prev_meta(md_path)

    img_idx = 0
    first_rel: str | None = None
    for img in content_el.find_all("img"):
        raw = img.get("data-src") or img.get("src") or ""
        raw = html_lib.unescape(raw).strip()
        if not raw or "mmbiz" not in raw:
            continue
        img_idx += 1
        ext = ext_from_url(raw)
        fname = f"{slug}-wechat-{img_idx:02d}.{ext}"
        rel = f"/images/blog/{fname}"
        dest = PUBLIC_IMG / fname
        if not dest.exists():
            download_image(session, raw, dest)
        img["src"] = rel
        for attr in ("data-src", "data-ratio", "data-s", "data-type", "data-w", "data-imgfileid", "data-aistatus"):
            if attr in img.attrs:
                del img.attrs[attr]
        if first_rel is None:
            first_rel = rel

    inner_html = "".join(str(x) for x in content_el.contents)
    description = plain_summary(inner_html, 220)
    body_md = html_to_md(inner_html)

    fm = build_frontmatter(title_txt, description, pub_date, keywords, first_rel, url)
    md_path.write_text(fm + body_md + "\n", encoding="utf-8")
    print(f"OK {slug}: title={title_txt!r} images={img_idx} -> {md_path.relative_to(ROOT)}")


def main() -> None:
    PUBLIC_IMG.mkdir(parents=True, exist_ok=True)
    BLOG_MD.mkdir(parents=True, exist_ok=True)
    with requests.Session() as session:
        for slug, aid in ARTICLES:
            process_one(session, slug, aid)


if __name__ == "__main__":
    main()
