# PatternCraft Pattern Catalog

Curated patterns from [patterncraft.fun](https://patterncraft.fun) for landing page backgrounds.
All patterns are pure CSS — zero dependencies, MIT licensed.

Use CSS custom properties (`var(--primary)`) so patterns adapt to the theme.

---

## Hero Patterns (dramatic, eye-catching)

### 1. Aurora Glow
Soft radial color bloom from top center. Best for dark mode.
```css
background-image:
  radial-gradient(ellipse 80% 50% at 50% -20%, oklch(from var(--primary) l c h / 0.15), transparent),
  radial-gradient(ellipse 60% 40% at 30% 10%, oklch(from var(--primary) l c h / 0.08), transparent),
  radial-gradient(ellipse 60% 40% at 70% 10%, oklch(from var(--primary) calc(l - 0.1) c calc(h + 40) / 0.08), transparent);
```
Mode: dark | Section: hero

### 2. Cosmic Radial
Dark center radiating outward with subtle color tint.
```css
background-image:
  radial-gradient(ellipse at 50% 50%, transparent 0%, oklch(0.12 0.02 var(--hue)) 100%),
  radial-gradient(circle at 50% 0%, oklch(from var(--primary) l c h / 0.1) 0%, transparent 60%);
```
Mode: dark | Section: hero

### 3. Diagonal Spotlight
Angled light beam cutting across the section.
```css
background-image:
  linear-gradient(135deg, oklch(from var(--primary) l c h / 0.08) 0%, transparent 40%, transparent 60%, oklch(from var(--primary) l c h / 0.05) 100%);
```
Mode: both | Section: hero, cta

---

## Section Patterns (subtle, non-distracting)

### 4. Dot Matrix
Evenly spaced subtle dots.
```css
background-image: radial-gradient(circle, oklch(from var(--primary) l c h / 0.08) 1px, transparent 1px);
background-size: 24px 24px;
```
Mode: both | Section: features, how-it-works

### 5. Fine Grid
Subtle intersecting lines.
```css
background-image:
  linear-gradient(oklch(from var(--primary) l c h / 0.04) 1px, transparent 1px),
  linear-gradient(90deg, oklch(from var(--primary) l c h / 0.04) 1px, transparent 1px);
background-size: 40px 40px;
```
Mode: both | Section: features

### 6. Gradient Mesh
Soft multi-point color transitions.
```css
background-image:
  radial-gradient(at 20% 80%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 50%),
  radial-gradient(at 80% 20%, oklch(from var(--primary) l c calc(h + 60) / 0.06) 0%, transparent 50%),
  radial-gradient(at 50% 50%, oklch(from var(--primary) l c calc(h - 30) / 0.04) 0%, transparent 60%);
```
Mode: dark | Section: features, how-it-works

---

## CTA Patterns (focused, attention-directing)

### 7. Center Spotlight
Circular glow drawing eye to center content.
```css
background-image:
  radial-gradient(circle at 50% 50%, oklch(from var(--primary) l c h / 0.12) 0%, transparent 50%);
```
Mode: dark | Section: cta

### 8. Vignette
Dark edges fading to lighter center — cinematic focus.
```css
background-image:
  radial-gradient(ellipse at 50% 50%, transparent 40%, oklch(0.08 0.01 0 / 0.6) 100%);
```
Mode: dark | Section: cta, hero

### 9. Streak Light
Diagonal light streaks for dynamic energy.
```css
background-image:
  linear-gradient(45deg, transparent 40%, oklch(from var(--primary) l c h / 0.06) 45%, transparent 50%),
  linear-gradient(45deg, transparent 60%, oklch(from var(--primary) l c h / 0.04) 65%, transparent 70%);
```
Mode: both | Section: cta

---

## Card / Overlay Patterns (decorative accents)

### 10. Noise Texture
Subtle grain overlay for depth. Apply with pseudo-element.
```css
/* Use as ::after overlay with mix-blend-mode */
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
```
Mode: both | Section: any (as overlay)

### 11. Glass Frost
Frosted glass effect with backdrop blur.
```css
background: oklch(from var(--card) l c h / 0.6);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid oklch(from var(--border) l c h / 0.3);
```
Mode: both | Section: cards, modals

### 12. Soft Gradient
Gentle two-tone directional gradient.
```css
background-image: linear-gradient(180deg, oklch(from var(--background) l c h) 0%, oklch(from var(--primary) calc(l * 0.3) calc(c * 0.1) h) 100%);
```
Mode: dark | Section: full-page background

---

## Usage Notes

- **Opacity control:** Keep pattern opacity between 0.04-0.15. Lower for light mode.
- **Fallback:** If `oklch(from ...)` relative color syntax isn't supported, use direct OKLCH values from the theme.
- **Performance:** All patterns are pure CSS gradients — no image downloads, instant render.
- **Layering:** Patterns can be combined (comma-separated background-image values).
- **Color adaptation:** Patterns use `var(--primary)` so they automatically match the brand theme.

## Simplified Fallback Syntax

If relative OKLCH color syntax causes issues, use direct values:

```css
/* Instead of oklch(from var(--primary) l c h / 0.12) */
/* Use the computed value directly */
background-image: radial-gradient(ellipse at 50% 0%, var(--primary) / 0.12, transparent 70%);
```

Or with Tailwind arbitrary values:
```tsx
className="bg-[radial-gradient(ellipse_at_50%_0%,_var(--primary)_/_0.12,_transparent_70%)]"
```
