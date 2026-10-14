# Step 2: Brand Configuration

Global find-replace of brand name, domain, and email across the codebase.

## Replacement Rules

Apply in this exact order using Edit tool with `replace_all: true`:

| # | Pattern | Replacement | Scope |
|---|---------|-------------|-------|
| 1 | `🎬 VideoFly` | `{logoEmoji} {projectName}` | All files |
| 2 | `support@videofly.app` | `{supportEmail}` | All files |
| 3 | `privacy@videofly.app` | `privacy@{domain}` | All files |
| 4 | `videofly.app` | `{domain}` | All files |
| 5 | `VideoFly` | `{projectName}` | All files |
| 6 | `videofly_` | `{localStoragePrefix}_` | localStorage keys only |
| 7 | `"videofly"` | `"{packageName}"` | package.json name only |

**Order matters:** Replace longer/more specific patterns first to avoid partial matches.

## File Priority Groups

Process files in this order. Read each file before editing.

### P1 — Core Config
- `src/config/site.ts` — name, description, url fallback
- `package.json` — name field only

### P2 — i18n Messages
- `src/messages/en.json` — all "VideoFly", emails, Metadata, FAQ, Mail, Emails sections
- `src/messages/zh.json` — same as above in Chinese

### P3 — Legal Pages
- `src/app/[locale]/(marketing)/privacy/page.tsx`
- `src/app/[locale]/(marketing)/terms/page.tsx`
- `src/app/[locale]/(marketing)/privacy-policy/page.tsx`
- `src/app/[locale]/(marketing)/terms-of-service/page.tsx`

### P4 — Email Templates
- `src/mail/components/email-layout.tsx`
- `src/mail/templates/welcome-email.tsx`
- `src/mail/templates/magic-link-email.tsx`
- `src/mail/templates/reset-password-email.tsx`
- `src/lib/emails/welcome-email.tsx`
- `src/lib/emails/reset-password-email.tsx`

### P5 — UI Components
- `src/components/landing/header.tsx` — logo text (3 instances)
- `src/components/landing/footer.tsx` — logo + team name
- `src/components/main-nav.tsx` — brand name
- `src/components/layout/header-simple.tsx` — brand span
- `src/components/site-footer.tsx` — logo alt text
- `src/components/landing/faq-section.tsx` — mailto link
- `src/components/price/pricing-cards.tsx` — mailto
- `src/components/price/aceternity-pricing.tsx` — mailto
- `src/components/price/creem-pricing.tsx` — mailto

### P6 — SEO & Metadata
- `src/app/layout.tsx` — metadata object
- `src/app/[locale]/(marketing)/page.tsx` — titles/descriptions
- `src/app/sitemap.ts` — fallback baseUrl

### P7 — Navigation & Misc
- `src/config/navigation.ts` — remove docs link entry
- `next.config.mjs` — remove unused image remote patterns

### P8 — LocalStorage Keys
- `src/components/landing/hero-section.tsx`
- `src/lib/video-task-storage.ts`
- `src/lib/video-history-storage.ts`
- `src/components/tool/tool-page-layout.tsx`

### P9 — Admin
- `src/app/[locale]/(admin)/admin/settings/page.tsx` — remove docs links

## Reference Content Generation

If `referenceUrl` was provided:
1. Use WebFetch to retrieve content from the URL
2. Analyze the content to understand the product
3. Generate product-specific copy for:
   - English product description and tagline
   - Chinese product description and tagline
   - FAQ answers (5-8 questions) in both languages
   - SEO keywords (10-15 terms)
4. Replace generic descriptions in `src/messages/en.json` and `zh.json`
5. Update Metadata, FAQ, Showcase, and email sections with generated content
