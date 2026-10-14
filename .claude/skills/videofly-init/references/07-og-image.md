# Step 7: OG Share Image Generation

Create a branded Open Graph image (1200x630) for social sharing.

## Primary: HTML Page + Playwright Screenshot

### 7.1 Create OG Image Route

Create `src/app/og-image/page.tsx` based on template at `.claude/skills/videofly-init/templates/og-image-page.tsx`.

Replace placeholders:
- `{{PROJECT_NAME}}` → projectName
- `{{DESCRIPTION}}` → description (truncate to ~80 chars)
- `{{DOMAIN}}` → domain
- `{{PRIMARY_COLOR}}` → primaryColorHex
- `{{LOGO_EMOJI}}` → logoEmoji

Page requirements:
- Exactly 1200x630px dimensions
- `export const dynamic = "force-static"` (prevent SSR interference)
- Self-contained styles (no external fonts/images that could fail)
- Use project's brand color for gradient/glow effects
- PatternCraft background pattern matching hero section

### 7.2 Screenshot with Playwright

If webapp-testing skill or Playwright MCP is available:
1. Ensure dev server running: `pnpm dev` (in background)
2. Navigate to `http://localhost:3000/og-image`
3. Set viewport to 1200x630
4. Wait for render completion
5. Screenshot to `public/og.png`

### 7.3 Update Metadata

In `src/app/layout.tsx`, ensure:
```ts
openGraph: {
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "{projectName}" }],
},
twitter: {
  card: "summary_large_image",
  images: ["/og.png"],
},
```

### 7.4 Exclude from Sitemap

Add `og-image` to exclude patterns in `src/app/sitemap.ts`.

## Fallback: No Playwright

If Playwright is not available:
1. Still create the `src/app/og-image/page.tsx` route
2. Print instruction: "Visit http://localhost:3000/og-image in your browser, take a 1200x630 screenshot, and save as public/og.png"
3. Or suggest using `canvas-design` skill if available

## Alternative: Extract from Reference URL

If referenceUrl was provided:
1. Run `python3 .claude/skills/videofly-init/scripts/fetch-og-image.py "{referenceUrl}" "public/og.png"`
2. If successful, skip generating a new OG image
3. If failed (no OG image found), proceed with HTML page approach

## Verification

After generation, verify:
- File exists at `public/og.png`
- File is approximately 1200x630 (some variance OK)
- File size is reasonable (50KB-500KB for PNG)

Provide testing links:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
