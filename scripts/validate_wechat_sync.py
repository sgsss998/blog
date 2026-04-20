#!/usr/bin/env python3
"""Validate WeChat-to-blog sync quality before publish."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "src/content/blog"
PUBLIC_DIR = ROOT / "public"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def split_frontmatter(raw: str) -> tuple[dict[str, str], str]:
    if not raw.startswith("---\n"):
        return {}, raw
    parts = raw.split("---\n", 2)
    if len(parts) < 3:
        return {}, raw
    front_raw = parts[1]
    body = parts[2]
    front: dict[str, str] = {}
    for line in front_raw.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        front[k.strip()] = v.strip().strip('"')
    return front, body


def check_post(md_path: Path) -> list[str]:
    errors: list[str] = []
    raw = read_text(md_path)
    front, body = split_frontmatter(raw)

    # 1) must keep source attribution
    if not re.search(r"原文首发.*mp\.weixin\.qq\.com", raw):
        errors.append("缺少“原文首发”微信链接标注")

    # 2) no remote wechat image/link residue
    if "mmbiz.qpic.cn" in raw:
        errors.append("正文中仍残留 mmbiz 外链，未完全本地化")

    # 3) hero image required and must exist
    hero = front.get("heroImage", "").strip()
    if not hero:
        errors.append("frontmatter 缺少 heroImage")
    elif not hero.startswith("/"):
        errors.append(f"heroImage 非站内路径: {hero}")
    else:
        hero_file = PUBLIC_DIR / hero.lstrip("/")
        if not hero_file.exists():
            errors.append(f"heroImage 文件不存在: {hero}")

    # 4) markdown images must be local and existing
    img_refs = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", body)
    if not img_refs:
        errors.append("正文无图片引用（疑似抓取不完整）")
    for ref in img_refs:
        ref = ref.strip()
        if ref.startswith("http://") or ref.startswith("https://"):
            errors.append(f"正文存在外链图片: {ref}")
            continue
        if not ref.startswith("/"):
            errors.append(f"正文图片不是绝对站内路径: {ref}")
            continue
        img_file = PUBLIC_DIR / ref.lstrip("/")
        if not img_file.exists():
            errors.append(f"正文图片文件不存在: {ref}")

    # 5) prevent ultra-short fallback summaries
    body_plain = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", body)
    body_plain = re.sub(r"\s+", "", body_plain)
    if len(body_plain) < 300:
        errors.append("正文字符过短（<300），疑似摘要化落盘")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate WeChat sync posts.")
    parser.add_argument(
        "--slugs",
        nargs="*",
        help="Optional slugs to validate. Default: all markdown posts.",
    )
    args = parser.parse_args()

    if args.slugs:
        md_files = [BLOG_DIR / f"{slug}.md" for slug in args.slugs]
    else:
        md_files = sorted(BLOG_DIR.glob("*.md"))

    failed = False
    for md in md_files:
        if not md.exists():
            print(f"[FAIL] {md.name}: 文件不存在")
            failed = True
            continue
        errs = check_post(md)
        if errs:
            failed = True
            print(f"[FAIL] {md.name}")
            for e in errs:
                print(f"  - {e}")
        else:
            print(f"[OK]   {md.name}")

    if failed:
        print("\nValidation failed. 请先修复以上问题再发布。")
        return 1

    print("\nValidation passed. 可以继续 build/push。")
    return 0


if __name__ == "__main__":
    sys.exit(main())

