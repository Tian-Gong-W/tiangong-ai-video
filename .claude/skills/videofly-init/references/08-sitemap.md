# Step 8: Sitemap Configuration

The project has a programmatic sitemap at `src/app/sitemap.ts`. Verify and update.

## Checks

1. **Base URL**: Confirm it uses `process.env.NEXT_PUBLIC_APP_URL` with fallback to `https://{domain}`
2. **Exclude list**: Ensure these routes are excluded:
   - `/dashboard/*`, `/admin/*`, `/auth/*`
   - `/login`, `/register`, `/settings`
   - `/og-image` (if created in Step 7)
3. **Priority assignments**:
   - Home: 1.0
   - Pricing: 0.9
   - Tool pages: 0.7
   - Legal pages: 0.3
4. **Locale support**: URLs generated for all locales (en = no prefix, zh = `/zh/...`)

## Robots.txt

File: `src/app/robots.ts`

Verify:
```ts
sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://{domain}"}/sitemap.xml`
```

## Minimal Changes Expected

This step is mostly verification. Only modify if:
- The fallback URL still says `videofly.app`
- The `/og-image` route needs to be added to excludes
- New marketing pages were added that need inclusion
