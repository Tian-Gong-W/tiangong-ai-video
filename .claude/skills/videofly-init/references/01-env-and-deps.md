# Step 1: Dependencies + ENV Configuration

## 1.1 Install Dependencies

```bash
pnpm install
```

If `pnpm` not found, check with `which pnpm` and suggest `npm install -g pnpm`.

## 1.2 Create Environment File

```bash
cp .env.example .env.local
```

## 1.3 Auto-Fill Deterministic Values

Edit `.env.local` to set these values:

```bash
NEXT_PUBLIC_APP_URL='http://localhost:3000'
NEXT_PUBLIC_BILLING_PROVIDER='creem'
```

If user provided admin email:
```bash
ADMIN_EMAIL='{adminEmail}'
```

## 1.4 Print Manual Configuration Guide

Print the following grouped by priority:

**Required for local dev (minimum):**
```
DATABASE_URL          → PostgreSQL connection string (Neon recommended)
BETTER_AUTH_SECRET    → Run: openssl rand -base64 32
```

**Required for auth:**
```
GOOGLE_CLIENT_ID      → Google Cloud Console > OAuth 2.0 Client
GOOGLE_CLIENT_SECRET  → Same location
```

**Required for AI features:**
```
EVOLINK_API_KEY       → Primary AI provider key
AI_CALLBACK_URL       → https://{domain}/api/v1/video/callback (production only)
CALLBACK_HMAC_SECRET  → Run: openssl rand -hex 32
```

**Required for storage:**
```
STORAGE_ENDPOINT      → Cloudflare R2 endpoint URL
STORAGE_REGION        → auto (for R2)
STORAGE_ACCESS_KEY    → R2 API token
STORAGE_SECRET_KEY    → R2 API token secret
STORAGE_BUCKET        → Bucket name
STORAGE_DOMAIN        → Public access domain
```

**Required for payment:**
```
CREEM_API_KEY         → Creem dashboard API key
CREEM_WEBHOOK_SECRET  → Creem webhook secret
```

**Required for email:**
```
RESEND_API_KEY        → resend.com API key
RESEND_FROM           → Verified sender (e.g., noreply@{domain})
```

**Optional:**
```
NEXT_PUBLIC_POSTHOG_KEY    → PostHog analytics
NEXT_PUBLIC_POSTHOG_HOST   → PostHog host
KIE_API_KEY                → Secondary AI provider
IS_DEBUG                   → Set to 'true' for dev
```

## Rules

- Do NOT generate random secrets automatically — let user do it for security
- Do NOT touch any external-account-dependent variables
- Only set NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_BILLING_PROVIDER, and ADMIN_EMAIL
