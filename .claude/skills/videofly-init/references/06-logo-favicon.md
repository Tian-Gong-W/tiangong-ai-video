# Step 6: Logo + Favicon Generation

Present options to user via AskUserQuestion, then execute chosen approach.

**Prerequisite**: Step 0 converts the color name to `primaryColorHex` (e.g., "violet" -> `#7c3aed`). All color values in this step use `primaryColorHex`.

## Options

| Option | Dependencies | Output | Recommended |
|--------|-------------|--------|-------------|
| A. SVG Monogram | None | SVG + webmanifest | Yes (default) |
| B. Pillow PNG | Python + Pillow | PNG logo + favicon set | Need PNG |
| C. ImageMagick | magick CLI | Text logo + favicons | Have ImageMagick |
| D. AI Generation | gemini-image / baoyu-image-gen skill | Pro AI logo | Have API key |
| E. User-Provided | None | User supplies file | Have logo |

## Option A: SVG Monogram (Recommended)

1. Ask user: shape preference (circle / rounded-square / shield)
2. Read template from `.claude/skills/videofly-init/templates/favicon-svg-{shape}.svg`
3. Compute foreground color (white for dark primary, black for light primary):
   - Parse `primaryColorHex` to RGB
   - Calculate relative luminance: `L = 0.2126*R + 0.7152*G + 0.0722*B`
   - If L > 0.5: FG = `#1a1a1a`, else FG = `#ffffff`
4. Replace placeholders: `{{PRIMARY_COLOR}}` → `primaryColorHex`, `{{FG_COLOR}}`, `{{LETTER}}`
5. Write `public/favicon.svg` and `public/logo.svg`
6. Write `public/site.webmanifest` from template (replace {{PROJECT_NAME}}, {{DESCRIPTION}}, {{PRIMARY_COLOR}} → `primaryColorHex`)
7. Check ImageMagick availability: `which magick || which convert`
8. If available, generate raster formats:
   ```bash
   magick public/favicon.svg -resize 16x16 /tmp/f16.png
   magick public/favicon.svg -resize 32x32 /tmp/f32.png
   magick /tmp/f16.png /tmp/f32.png public/favicon.ico
   magick public/favicon.svg -resize 180x180 -background "{primaryColorHex}" -flatten public/apple-touch-icon.png
   magick public/favicon.svg -resize 192x192 public/icon-192.png
   magick public/favicon.svg -resize 512x512 public/icon-512.png
   ```
9. If not available, print: "Install ImageMagick or visit favicon.io to generate ICO/PNG from your SVG"

## Option B: Pillow PNG

1. Check: `python3 -c "import PIL"` — if fails, run `pip install Pillow`
2. Run:
   ```bash
   python3 .claude/skills/videofly-init/scripts/generate-logo.py \
     --brand-name "{projectName}" \
     --primary-color "{primaryColorHex}" \
     --public-dir "public"
   ```
3. Script outputs: logo.png (512x512), favicon.ico (16+32), apple-touch-icon.png (180x180)

## Option C: ImageMagick

1. Verify: `magick --version`
2. Generate logo:
   ```bash
   magick -size 512x512 xc:"{primaryColorHex}" \
     -font "Arial-Bold" -pointsize 200 \
     -fill "{fgColor}" -gravity center \
     -annotate 0 "{letter}" public/logo.png
   ```
3. Generate favicon sizes from logo.png

## Option D: AI Generation

1. Check installed skills: look for `gemini-image` or `baoyu-image-gen` in available skills
2. If found, generate with prompt:
   > Create a minimal, modern logo icon for '{projectName}', a {description}.
   > Use {primaryColor} as primary color. Simple geometric design, works at 16x16px.
   > Solid background, no text, flat design, centered icon.
3. Save output, then process into favicon sizes via ImageMagick or Pillow

## Option E: User-Provided

1. Ask for logo file path
2. Copy to `public/logo.svg` or `public/logo.png`
3. Generate favicon sizes from provided file

## Post-Generation (all options)

Update `src/app/layout.tsx` icons:
```ts
icons: {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.ico", sizes: "32x32" },
  ],
  apple: "/apple-touch-icon.png",
},
```

Add `<link rel="manifest" href="/site.webmanifest">` if not present.

## Design Rules

- Max 3 letters in monogram (illegible at 16px beyond 3)
- Use `font-weight="bold"` (regular vanishes at small sizes)
- `apple-touch-icon.png` MUST have solid background (transparent = black on iOS)
- `favicon.ico` MUST contain both 16x16 and 32x32 sizes
- Minimum 4.5:1 contrast ratio (WCAG AA)
- Keep filenames stable: `favicon.svg`, `favicon.ico`, `logo.svg` — never rename
