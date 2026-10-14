# Step 0: Input Normalization

Collect and normalize user input into a canonical project brief before any file modifications.

## Required Fields

Ask user via AskUserQuestion if not provided:

| Field | Type | Validation | Example |
|-------|------|-----------|---------|
| `projectName` | string | Non-empty, no special chars | ClipMagic |
| `domain` | string | Valid domain format | clipmagic.com |
| `description` | string | 10-150 chars | AI-powered short video creation platform |

## Optional Fields (with defaults)

| Field | Default | Notes |
|-------|---------|-------|
| `referenceUrl` | null | URL to fetch for content generation |
| `supportEmail` | `support@{domain}` | Must be valid email format |
| `logoEmoji` | 🎬 | Single emoji character |
| `primaryColor` | violet | Color name in Chinese or English (see color table below) |
| `locales` | `["en", "zh"]` | Array of locale codes |
| `darkMode` | `true` | Boolean |

## Auto-Derived Fields

Compute from user inputs — never ask:

```
packageName        = kebab-case(projectName)     # "ClipMagic" -> "clip-magic"
localStoragePrefix = snake_case(projectName)     # "ClipMagic" -> "clip_magic"
appUrl             = "https://{domain}"           # "clipmagic.com" -> "https://clipmagic.com"
privacyEmail       = "privacy@{domain}"
primaryColorHex    = color name -> hex (see mapping table below)
```

## Color Name -> Hex Mapping

Convert user's color name to hex for Step 3 (theme), Step 6 (logo), Step 7 (OG image):

| Name (CN) | Name (EN) | Hex | oklch approx |
|-----------|-----------|-----|-------------|
| sky blue | `#38bdf8` | 0.77 0.15 230 |
| indigo | `#6366f1` | 0.55 0.22 265 |
| royal blue | `#3b82f6` | 0.62 0.19 250 |
| violet | `#7c3aed` | 0.53 0.24 285 |
| lavender | `#a78bfa` | 0.68 0.16 285 |
| magenta | `#ec4899` | 0.59 0.22 350 |
| coral | `#f97316` | 0.70 0.19 45 |
| rose | `#f43f5e` | 0.59 0.23 15 |
| amber | `#f59e0b` | 0.75 0.17 70 |
| gold | `#eab308` | 0.78 0.17 85 |
| emerald | `#10b981` | 0.68 0.16 165 |
| mint | `#34d399` | 0.76 0.15 165 |
| forest green | `#047857` | 0.50 0.14 165 |
| cyan | `#06b6d4` | 0.70 0.14 210 |
| graphite | `#57534e` | 0.42 0.01 60 |

If user says a color not in the table (e.g., "blue", "green"), pick the closest hex based on semantics.

### Default Color by Product Type

If user doesn't specify a color, auto-recommend based on product description:

| Product Type | Recommended | Feel |
|-------------|-------------|------|
| AI / Tech / Dev tools | violet | Innovation, intelligence |
| Video / Creative / Design | magenta | Creative, energetic |
| Finance / Business / Enterprise | indigo | Trust, professional |
| Social / Content / Media | sky blue | Open, friendly |
| E-commerce / Retail | coral | Passion, action |
| Health / Eco / Education | emerald | Natural, growth |
| Gaming / Entertainment | amber | Energy, warmth |
| Luxury / Premium | graphite | Premium, sophisticated |

## Collection Flow

1. Check if user already provided fields in their message
2. For missing required fields: use AskUserQuestion with one question per field
3. **Actively present optional fields**: after collecting required fields, show all optional fields with their defaults and ask if user wants to change any:

```
Optional fields (press enter to use defaults, or type to change):
- Reference URL (referenceUrl): none  <-- providing this enables auto-generated copy & FAQ
- Support email (supportEmail): support@{domain}
- Logo Emoji: 🎬
- Brand color (primaryColor): violet (auto-recommended based on product type)
```

**Important**: `referenceUrl` significantly affects content generation (determines whether copy, FAQ, SEO keywords are auto-generated). Must actively prompt user.

4. Print normalized brief summary for user confirmation:

```
Project Brief:
  Name:        {projectName}
  Domain:      {domain}
  Description: {description}
  Email:       {supportEmail}
  Color:       {primaryColor} -> {primaryColorHex}
  Locales:     {locales}
  Reference:   {referenceUrl || "none"}
```

## Rules

- Must actively present optional fields for user to review — never skip silently (especially referenceUrl)
- Only use defaults after user explicitly confirms or skips
- If user provides partial info (e.g., "init project ClipMagic"), extract what's available and ask for the rest
- primaryColor accepts color names (Chinese or English), no hex required from user
- If user doesn't specify color, auto-recommend based on description (see table above)
- Trim whitespace from all string inputs
