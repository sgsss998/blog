# ailaoming.com

Astro-based personal site for AI干货家老明.

The site is maintained as an AI-focused commercial lead-generation site, with public pages for AI services, a local AI implementation self-check, lightweight lead magnets, reusable Skills, project progress, Shanghai AI Coffee Chat, and AI technical articles.

## Positioning

- AI workflow diagnosis
- AI implementation self-check
- Lightweight lead magnets and productized entry points
- Personal knowledge-base organization
- Office Skills / SOP customization
- AI system implementation support
- Shanghai AI Coffee Chat
- AI technical articles

The public site should stay AI-focused. Life, skincare, selfie, dating, and unrelated personal posts are excluded by default unless a separate section is explicitly approved later.

## Commands

```bash
npm run dev
npm run build
npm run health:content
npm run validate:site
npm run release:candidates
npm run release:approval
npm run ops:audit
npm run validate:wechat
```

Use Node.js `>=22.12.0`.

If the local default `node` is older, Astro will refuse to build. In the Codex desktop environment, use the bundled Node runtime:

```bash
PATH=/Users/danningyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build
```

## Release Checks

Before any public push:

1. Run `npm run build`.
2. Run `npm run health:content`.
3. Run `npm run validate:site`.
4. Run `npm run release:candidates`.
5. Run `npm run release:approval` to generate a local approval summary under `/private/tmp`.
6. Run `npm run ops:audit` to generate a local operations summary under `/private/tmp`.
7. If WeChat articles changed, run `npm run validate:wechat` or validate the changed slugs.
8. If article images were redacted, confirm `scripts/redacted_image_manifest.json` is updated and `npm run validate:site` passes.
9. Review `git status --short --branch`, `git remote -v`, and `git branch -vv`.
10. Exclude local Astro cache changes unless intentionally needed:
   - `.astro/data-store.json`
   - `.astro/settings.json`
11. Ask for explicit approval before pushing public content changes.

## Key Files

- `SITE_MAINTENANCE.md` - site maintenance and approval SOP.
- `SOP-微信公众号同步至ailaoming.md` - WeChat article sync SOP.
- `scripts/check_content_health.mjs` - monthly content health audit.
- `scripts/validate_site_release.mjs` - release validation script.
- `scripts/check_release_candidates.mjs` - read-only release candidate inventory.
- `scripts/generate_publish_approval.mjs` - local Markdown approval summary generator.
- `scripts/generate_ops_audit.mjs` - local operations audit summary for content cadence, CTA coverage, Coffee Chat path, and release readiness.
- `scripts/redacted_image_manifest.json` - hash lock for public-safe replacement images.
- `scripts/validate_wechat_sync.py` - WeChat article validation script.
- `src/content/blog/` - AI article Markdown files.
- `public/images/blog/` - local article images.
- `src/pages/` - public pages.
- `src/components/` - shared site components.

## Privacy Boundary

Do not publish real customer materials, internal company materials, private chats, credentials, detailed holdings, or non-approved personal identity information.

If a historical screenshot is worth keeping for article structure but contains privacy or brand risk, replace it with a same-dimension public-safe placeholder and register it in `scripts/redacted_image_manifest.json`. The release validator will fail if a registered image is replaced without a fresh review.
