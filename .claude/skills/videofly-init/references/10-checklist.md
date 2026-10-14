# Step 10: Validation & Report

## Automated Checks

Run in order:

```bash
rm -rf .next          # Clear build cache
pnpm build            # Must pass with zero errors
```

If build fails:
1. Read the error output
2. Fix the issue (usually a missing replacement or syntax error)
3. Retry build

## Manual Verification Checklist

Print for user:

### Brand & Theme
- [ ] Homepage shows correct brand name
- [ ] Brand color applied to primary elements
- [ ] Header logo/emoji displays correctly
- [ ] Footer shows correct brand name and copyright year
- [ ] PatternCraft backgrounds visible on landing sections

### Content
- [ ] Hero section copy matches product description
- [ ] Features section describes actual product features
- [ ] FAQ answers are product-specific
- [ ] Pricing page shows correct brand name and support email

### SEO & Sharing
- [ ] Browser tab shows correct title and favicon
- [ ] View source → check `<meta>` OG tags are present
- [ ] `/sitemap.xml` loads and shows correct domain
- [ ] `/robots.txt` references sitemap URL correctly
- [ ] OG image exists at `/og.png` (1200x630)

### Legal
- [ ] `/privacy` loads with correct brand name and today's date
- [ ] `/terms` loads with correct brand name and today's date
- [ ] Support email addresses are correct throughout

### Email Templates
- [ ] Check email templates reference correct brand name (visual check only)

### Mobile
- [ ] Landing page renders correctly on mobile viewport
- [ ] Navigation menu works on mobile

## Summary Output

Print at the end:

```
╔══════════════════════════════════════════════╗
║  {projectName} - Initialization Complete     ║
╠══════════════════════════════════════════════╣
║                                              ║
║  ✓ Dependencies installed                    ║
║  ✓ ENV file created (.env.local)             ║
║  ✓ Brand config applied (30+ files)          ║
║  ✓ Theme generated from {primaryColor}       ║
║  ✓ SEO metadata + JSON-LD configured         ║
║  ✓ Landing page copy + patterns applied      ║
║  ✓ Logo + Favicon generated                  ║
║  ✓ OG share image created                    ║
║  ✓ Sitemap verified                          ║
║  ✓ Legal pages updated                       ║
║  ✓ Build passed                              ║
║                                              ║
║  Manual TODO:                                ║
║  · Fill API keys in .env.local               ║
║  · Set up database + run pnpm db:push        ║
║  · Configure Google OAuth redirect URIs      ║
║  · Create Creem/Stripe payment products      ║
║  · Update product IDs in pricing-user.ts     ║
║  · Set up R2/S3 storage bucket               ║
║  · Configure Resend email sending domain     ║
║                                              ║
║  Run: pnpm dev                               ║
╚══════════════════════════════════════════════╝
```

Adjust checkmarks based on which steps actually completed vs skipped.
