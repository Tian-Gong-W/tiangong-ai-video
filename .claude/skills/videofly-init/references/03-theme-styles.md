# Step 3: Theme & Style Configuration

Generate a cohesive color theme based on brand identity, apply to `src/styles/globals.css`.

## Target File

`src/styles/globals.css` — update oklch color values in `:root` (light) and `.dark` blocks.

## Generation Workflow

### 1) Infer brand vibe from brief + references

From user's project description, keywords, and reference links, infer:

- Product category (devtool/finance/health/education/creator/consumer...)
- Tone (serious, playful, premium, friendly, minimal, bold)
- Any explicit brand colors (hex/rgb/oklch), or "avoid colors" constraints

### 2) Choose primary hue and build palette

Prefer explicit user-provided brand colors (`primaryColor` field). If absent, pick a primary that fits the category:

| Category | Recommended Hues |
|----------|-----------------|
| devtools/infra | blue/indigo/cyan (trust + clarity) |
| finance/compliance | blue/teal (stability) |
| creative/AI/consumer | purple/pink (energy) |
| wellness | teal/green (calm) |
| productivity | indigo/violet (focus) |

Then generate a full palette in **oklch()** format (the file's native format):

**Brand layer** (the core identity — must feel intentional):
- `--primary`, `--primary-foreground`, `--ring` — aligned with brand color
- `--accent`, `--accent-foreground` — subtle highlights/hover
- `--chart-1..5` — coordinated set (chart-1 aligns with primary; rest distinct but harmonious)
- `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-ring` — align with primary

**Neutral layer** (keep close to existing values unless user requests otherwise):
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`

**Functional layer** (rarely change):
- `--destructive`, `--destructive-foreground` — keep readable red tones

### 3) Write color values into globals.css

Color format: use **oklch()** values (the file's native format).
- If user provides hex/rgb, convert to oklch (ideal) or approximate (acceptable for v1).
- Ensure light and dark mode both have good contrast.

### 4) tweakcn as optional reference

If manual palette design feels uncertain, use tweakcn editor as a starting point:

| Color Family | Recommended Theme |
|-------------|------------------|
| Blue | twitter, ocean |
| Purple | default (shadcn) |
| Green | emerald |
| Orange / Warm | amber |

Methods (in priority order):
1. WebFetch tweakcn editor page for preset CSS variables, extract color values only
2. Hand-write oklch values based on brand color + hue offsets
3. CLI `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/{theme}.json` (often unstable, last resort)

When copying from any generator, **only extract color variable lines** — discard everything else.

## Scope: Color Variables ONLY (CRITICAL)

Theme generation MUST only modify color-related CSS variables. Do NOT touch anything else.

### Allowed to modify

Only oklch color values in `:root` and `.dark` blocks:

```
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--chart-1 through --chart-5
--sidebar, --sidebar-foreground
--sidebar-primary, --sidebar-primary-foreground
--sidebar-accent, --sidebar-accent-foreground
--sidebar-border, --sidebar-ring
```

### NEVER modify

- `--radius` — border radius affects all component shapes
- `--shadow-*` (all 8 levels) — shadow changes break visual consistency
- `--font-sans`, `--font-mono`, `--font-heading` — font changes break typography
- Animation keyframes and `--animate-*` variables
- `@theme inline` block structure
- `@import` statements
- Anything outside `:root` and `.dark` blocks

## Quality Bar

- Theme reads like a real tweakcn-tuned theme: primary/accent/ring/chart/sidebar feel intentional
- Light + dark both have good contrast (buttons, links, focus ring are readable)
- No "template default look": do not keep original primary hue unless it matches the new brand
- Brand layer is distinct and cohesive; neutral layer stays clean

## Alternative Theme Files

`src/styles/themes/` contains reference themes (emerald-dark, modern-blue, purple-gradient).
Do not modify these. They may contain `--radius` values — ignore those if referencing.

## Verification

After theme modification:
1. Run `pnpm dev` to preview
2. Check dark mode (default) and light mode display
3. Confirm landing page sections auto-adapt to `--primary`
