# Step 4: SEO & GEO Optimization

Update SEO metadata, configure AI bot access, apply GEO optimization methods.

**GEO = Generative Engine Optimization** — optimize content to be cited by AI search engines (ChatGPT, Perplexity, Claude, Copilot). Being cited = the new "ranking #1".

## 4.1-4.3 Brand Name Replacement (done by Step 2)

The following files have brand name/domain replacement already handled by **Step 2 (Brand Configuration)** via global find-replace. Do not repeat:

- `src/config/site.ts` — name, description, url (Step 2 P1)
- `src/app/layout.tsx` — brand name in metadata (Step 2 P6)
- `src/app/[locale]/(marketing)/page.tsx` — titles/descriptions (Step 2 P6)

**Note**: `src/app/layout.tsx` uses `getLocale()` from next-intl for locale. Do not modify the locale retrieval logic.

**SEO enhancements for this step** (beyond Step 2 scope):

1. **Expand keywords**: generate 10-15 keywords in `layout.tsx` `metadata.keywords` based on product description (mix head terms + long-tail)
2. **OG image config**: confirm `openGraph.images` and `twitter.images` point to `/og.png` (Step 7 generates this file)
3. **Icons config**: confirm favicon paths are correct (Step 6 generates favicon files)
4. **Marketing page tagline**: if `referenceUrl` provided, generate more precise EN/ZH tagline and description (beyond simple brand name replacement)

## 4.4 JSON-LD Structured Data

**Already built into template — do not add manually.**

### WebSite + Organization Schema (built-in)

`src/app/layout.tsx` `<head>` already contains WebSite and Organization JSON-LD schema. Brand name is referenced via `siteConfig`, auto-updated by Step 2 global replacement.

To extend (e.g., add SoftwareApplication schema), append to existing `@graph` array.

### FAQPage Schema (built-in, +40% AI visibility)

`src/components/landing/faq-section.tsx` has built-in FAQPage JSON-LD schema that auto-reads FAQ content from i18n. When Step 5 replaces FAQ copy, schema auto-adapts. **Do not duplicate.**

### SpeakableSpecification (optional, voice search + AI extraction)

Optional addition to WebPage schema to help AI know which content to cite:

```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": ["h1", ".hero-description", ".faq-answer"]
}
```

## 4.5 Robots.txt — AI Bot Access

File: `src/app/robots.ts` — verify all major AI search engine crawlers are allowed:

```ts
// Must allow these AI bots:
// - Googlebot (Google + Google AI Overview)
// - Bingbot (Bing + Microsoft Copilot)
// - GPTBot (OpenAI / ChatGPT)
// - ChatGPT-User (ChatGPT with browsing)
// - PerplexityBot (Perplexity)
// - ClaudeBot (Claude)
// - anthropic-ai (Anthropic)
```

Verify robots.txt doesn't block these crawlers. Default Next.js robots.ts is usually allow-all — just confirm.

Also confirm sitemap reference:
```ts
sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://{domain}"}/sitemap.xml`
```

## 4.6 GEO Optimization Methods (Princeton Research)

Apply these high-yield methods to landing page and FAQ content during init:

### Must-do (high yield)

| Method | Improvement | How to apply |
|--------|-------------|-------------|
| **Cite authoritative sources** | +40% | Add "According to..." citations in FAQ answers |
| **Add statistics** | +37% | Include concrete numbers in product descriptions/FAQ |
| **FAQPage Schema** | +40% | See 4.4 — structured FAQ data (already built-in) |
| **Authoritative tone** | +25% | Use confident, professional language |

### Recommended (content level)

| Method | Improvement | How to apply |
|--------|-------------|-------------|
| **Easy to understand** | +20% | Explain complex concepts with analogies |
| **Technical terminology** | +18% | Use appropriate domain terms |
| **Fluency optimization** | +15-30% | Short paragraphs (2-3 sentences), lists, tables |

### Avoid

| Method | Impact | Note |
|--------|--------|------|
| **Keyword stuffing** | **-10%** | AI search engines penalize keyword stuffing |

### Best Combinations

- **Fluency + Statistics** = highest overall improvement
- **Citations + Authoritative tone** = best for professional/business content
- **Easy to understand + Statistics** = best for consumer content

## 4.7 Platform-Specific Optimization

Key differences across AI search engines:

| Platform | Primary Index | Key Factor | Init action |
|----------|--------------|------------|-------------|
| ChatGPT | Web (Bing-based) | Domain authority, freshness | Allow GPTBot |
| Perplexity | Own + Google | Semantic relevance, FAQ Schema | Allow PerplexityBot |
| Google SGE | Google | E-E-A-T, Schema | Structured Data |
| Copilot | Bing | Bing index | Allow Bingbot |
| Claude | **Brave Search** | Fact density | Allow ClaudeBot |

**Important**: Claude uses Brave Search, not Google — ensure Brave can index your site.

## 4.8 SEO Content Generation Rules

If `referenceUrl` provided, follow these when generating content:

- **Title formula**: "{core keyword} | {core benefit} | {brand}" (50-60 chars)
- **Description**: include benefits + CTA + emotional trigger (150-160 chars)
- **Keywords**: mix head terms (high volume) + long-tail (specific scenarios)
- **FAQ content**: "answer first" format (direct answer, then expand)
- **Alt text**: descriptive, naturally include brand name

## Files Modified

**This step (SEO enhancements):**
- `src/app/layout.tsx` — expand keywords, OG images, icons config
- `src/app/[locale]/(marketing)/page.tsx` — optimize tagline/description if referenceUrl available
- `src/app/robots.ts` — verify AI bot access
- `src/app/sitemap.ts` — verify baseUrl

**Already done by Step 2 (do not repeat):**
- `src/config/site.ts` — brand name/domain replacement
- `src/app/layout.tsx` — brand name in metadata
- `src/lib/seo.ts` — domain reference replacement
