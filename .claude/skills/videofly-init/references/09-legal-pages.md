# Step 9: Legal Pages

Update Privacy Policy and Terms of Service with brand information.

## Main Pages (full bilingual content)

### Privacy Policy
File: `src/app/[locale]/(marketing)/privacy/page.tsx`

Replacements:
- All `"VideoFly"` → `{projectName}`
- `"support@videofly.app"` → `{supportEmail}`
- `"privacy@videofly.app"` → `privacy@{domain}`
- Effective date → today's date (format: Month DD, YYYY / YYYY年M月D日)
- Keep the bilingual inline structure: `{locale === "zh" ? <Chinese> : <English>}`

### Terms of Service
File: `src/app/[locale]/(marketing)/terms/page.tsx`

Same replacements as Privacy Policy plus:
- Credit/payment terms — keep generic unless referenceUrl provides specifics
- Service description — update to match product description

## Stub Pages (redirect)

These are shorter duplicate pages that should redirect to the main versions:

### `src/app/[locale]/(marketing)/privacy-policy/page.tsx`
Replace entire content with:
```tsx
import { redirect } from "next/navigation";

export default function PrivacyPolicyRedirect() {
  redirect("/privacy");
}
```

### `src/app/[locale]/(marketing)/terms-of-service/page.tsx`
Replace entire content with:
```tsx
import { redirect } from "next/navigation";

export default function TermsOfServiceRedirect() {
  redirect("/terms");
}
```

## Content Customization

If `referenceUrl` was provided, optionally adjust:
- "Information We Collect" section — scope to actual product features
- Data retention periods — match product policies
- Third-party services mentioned — match actual integrations
- Refund/credit policies — match actual payment terms

If no referenceUrl: keep existing legal structure, only do brand-name replacement.

## Rules

- Never invent specific legal claims (e.g., HIPAA compliance) without user confirmation
- Keep existing GDPR/CCPA language intact
- Ensure both EN and ZH versions are updated consistently
- Do not remove any existing legal protections or disclaimers
