---
name: videofly-init
description: >
  Comprehensive VideoFly template initialization. Handles brand config, dependency
  install, ENV setup, theme generation, SEO optimization, landing page customization
  with PatternCraft backgrounds, logo/favicon creation, OG image generation, sitemap
  verification, and legal pages. Use when user mentions "初始化项目", "init project",
  "初始化模板", "setup template", "initialize site", "新建站点", "项目初始化",
  "配置模板", "template init", "rebrand", or "customize template".
---

# VideoFly Template Initializer

Complete project initialization from brand info to production-ready site.

## Required Input

| Field | Description | Example |
|-------|-------------|---------|
| **projectName** | Brand name | ClipMagic |
| **domain** | Production domain | clipmagic.com |
| **description** | One-line product description | AI-powered short video creation |

## Optional Input

| Field | Default | Description |
|-------|---------|-------------|
| referenceUrl | — | URL to fetch for content generation |
| supportEmail | support@{domain} | Support contact |
| logoEmoji | 🎬 | Temporary logo emoji |
| primaryColor | 紫罗兰 | 品牌主色调（中文颜色名，如：天蓝、琥珀、翠绿、珊瑚红） |
| locales | ["en","zh"] | Supported languages |
| darkMode | true | Default to dark mode |

## Workflow (10 Steps)

Execute steps sequentially. Load each reference file only when executing that step.

### Step 0: Normalize Input
Collect and validate user input. Derive defaults.
→ [references/00-project-brief.md](references/00-project-brief.md)

### Step 1: Install Dependencies + ENV
Run `pnpm install`, create `.env.local` with deterministic values.
→ [references/01-env-and-deps.md](references/01-env-and-deps.md)

### Step 2: Brand Configuration
Global find-replace of brand name, domain, emails across 30+ files.
→ [references/02-brand-config.md](references/02-brand-config.md)
→ [references/config-map.md](references/config-map.md)

### Step 3: Theme & Styles
使用 tweakcn 主题生成器配置主题配色。
→ [references/03-theme-styles.md](references/03-theme-styles.md)

### Step 4: SEO Optimization
Update metadata, keywords, JSON-LD structured data.
→ [references/04-seo-metadata.md](references/04-seo-metadata.md)

### Step 5: Landing Page
Replace copy, add PatternCraft atmosphere backgrounds.
→ [references/05-landing-page.md](references/05-landing-page.md)
→ [references/pattern-catalog.md](references/pattern-catalog.md)

### Step 6: Logo + Favicon
Multiple generation options (SVG monogram, Pillow, ImageMagick, AI, user-provided).
→ [references/06-logo-favicon.md](references/06-logo-favicon.md)

### Step 7: OG Share Image
Create OG image page + Playwright screenshot (or manual fallback).
→ [references/07-og-image.md](references/07-og-image.md)

### Step 8: Sitemap
Verify programmatic sitemap config, add exclusions.
→ [references/08-sitemap.md](references/08-sitemap.md)

### Step 9: Legal Pages
Update privacy policy + terms of service with brand info.
→ [references/09-legal-pages.md](references/09-legal-pages.md)

### Step 10: Validate & Report
Build check, verification checklist, summary of changes.
→ [references/10-checklist.md](references/10-checklist.md)

## Execution Rules

- Load only the current step's reference file, not all at once
- If a step fails, log the error and continue to the next step
- Missing optional inputs use defaults — never block execution
- Do NOT modify external-account-dependent config (API keys, payment IDs, database)
- Prefer Edit with `replace_all: true` for global string swaps
- Always read a file before editing it
