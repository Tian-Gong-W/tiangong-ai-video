# Step 5: Landing Page Configuration

Replace copy, enhance with installed component library, add PatternCraft atmosphere backgrounds, control section visibility.

## Installed Component Library

The project has 150+ components ready to use. **Prioritize these over custom code.**

Refer to `docs/spec/COMPONENT_SPECIFICATION.md` for the full spec. Key components for landing pages:

### Magic UI (`@/components/magicui/`) — 36 components

**Button animations** (for CTA):
- `ShimmerButton` — shimmer effect (currently used in Features, CTA)
- `ShinyButton` — glow effect
- `RippleButton` — ripple click effect
- `PulsatingButton` — pulsing attention-grab
- `RainbowButton` — rainbow gradient
- `InteractiveHoverButton` — hover interaction

**Text animations** (for Hero titles, section headings):
- `HyperText` — scramble/decode text effect
- `MorphingText` — morph between text strings
- `FlipText` — flip animation
- `WordRotate` — cycle through words (great for Hero subtitle variations)
- `AnimatedShinyText` — shiny text effect
- `AnimatedGradientText` — gradient sweep
- `SparklesText` — sparkle effect
- `TypingAnimation` — typewriter effect

**Container animations** (for feature cards, stats):
- `BoxReveal` — reveal on scroll
- `NumberTicker` — animated number counter (currently used in HowItWorks)
- `MagicCard` — hover-interactive card
- `BentoGrid` — bento grid layout (great for features)
- `AvatarCircles` — stacked avatar display (for social proof)
- `AnimatedList` — staggered list animation
- `VelocityScroll` — infinite scroll text

**Background effects** (for section atmosphere):
- `Meteors` — falling meteor particles (currently used in Hero)
- `AnimatedGridPattern` — animated grid background
- `DotPattern` — dot matrix background
- `GridPattern` — grid background
- `InteractiveGridPattern` — interactive grid on hover
- `Ripple` — expanding ripple effect

**Other** (for section enhancements):
- `BlurFade` — blur-in animation (currently used everywhere)
- `BorderBeam` — animated border beam (currently used in CTA)
- `Confetti` — celebration effect (for successful actions)
- `HeroVideoDialog` — video preview modal
- `Marquee` — infinite scroll carousel (for testimonials)

### Animate UI (`@/components/animate-ui/`) — 6 components

- `CountingNumber` — smooth number counting
- `SlidingNumber` — digit-slide counter
- `Writing` — handwriting animation
- `Typing` — typing cursor effect
- `Highlight` — highlight animation
- `Gradient` — animated gradient background

### UI Base (`@/components/ui/`) — 55 components

Key ones for landing:
- `Accordion` — for FAQ section (currently used)
- `NavigationMenu` — for header (currently used)
- `Card` — for feature/benefit cards
- `Badge` — for tags/labels
- `Sheet` — for mobile nav (currently used)
- `Separator` — for section dividers

## Built-in Template Optimizations

The following are already built into the template code — **no manual handling needed during init**:

- **Theme-adaptive colors**: all landing components (Hero, Features, HowItWorks, CTA) use `oklch(from var(--primary) ...)` CSS relative color syntax — colors auto-follow the theme set in Step 3
- **Hero badge**: already reads from i18n (`Hero.badge`) and renders — just replace the copy
- **FAQPage JSON-LD**: built into `faq-section.tsx`, auto-reads FAQ content from i18n for structured data
- **No fake data**: CTA section's fake testimonials/avatars have been deleted — no fake social proof to clean up

## Current Landing Structure & Components Used

```
Section               | Components Used                              | i18n Key
----------------------|----------------------------------------------|----------
Hero                  | BlurFade, Meteors, VideoGeneratorInput,      | Hero.*
                      | AlertDialog, motion                          |
Features              | BlurFade, ShimmerButton, motion               | Features.*
HowItWorks            | BlurFade, NumberTicker, motion                | HowItWorks.*
Showcase (commented)  | BlurFade, BorderBeam, ShimmerButton           | Showcase.*
CTA                   | BlurFade, ShimmerButton, BorderBeam, motion   | CTA.*
FAQ                   | BlurFade, Accordion, JSON-LD                  | FAQ.*
Header                | NavigationMenu, DropdownMenu, Sheet, Button   | Navigation.*
Footer                | LocaleLink                                    | Footer.*
```

## 5a. Copy Replacement

### i18n Files
Update `src/messages/en.json` and `src/messages/zh.json`:

- **Metadata** — title, description
- **Hero** — title, subtitle, CTA text (in hero-section.tsx component)
- **Features** — section title, 3 feature names/descriptions, 3 benefit names/descriptions
- **HowItWorks** — section title, 4 step titles/descriptions/durations
- **CTA** — heading, description, button text, benefit list items
- **FAQ** — section title/subtitle, all Q&A pairs (regenerate for new product)
- **Footer** — brand description, copyright
- **Navigation** — menu items, header text

If `referenceUrl` provided: fetch content and generate product-specific copy.
If not: do basic brand-name replacement only; keep generic AI video descriptions.

### FAQ Generation Rules
- 5-8 questions covering: what is it, pricing/credits, supported features, data privacy, refund policy, support
- Answers: concise (2-3 sentences), include statistics where possible
- No fake social proof (don't invent user counts or testimonials)

## 5b. Component Enhancement Suggestions

When customizing the landing page, suggest component upgrades based on the product type:

### Hero Section
- **Current**: Badge (from i18n) + static title with BlurFade + Meteors + theme-adaptive oklch gradients
- **Options**:
  - Add `WordRotate` or `MorphingText` to cycle through product benefits in subtitle
  - Replace `Meteors` with `AnimatedGridPattern` or `Ripple` for different vibes
  - Use `AnimatedGradientText` for the main heading to add visual interest
  - Add `HeroVideoDialog` if product has a demo video

### Features Section
- **Current**: 3 feature cards + 3 benefit cards with BlurFade
- **Options**:
  - Switch to `BentoGrid` layout for a modern asymmetric grid
  - Use `MagicCard` for hover-interactive feature cards
  - Add `BoxReveal` for scroll-triggered reveals instead of BlurFade
  - Use `NumberTicker` or `CountingNumber` for any stats in features

### HowItWorks Section
- **Current**: 4-step timeline with NumberTicker
- **Options**:
  - Add `AnimatedBeam` to connect steps visually
  - Use `AnimatedList` for staggered step appearance

### CTA Section
- **Current**: BorderBeam card with ShimmerButton, theme-adaptive oklch colors, no fake social proof
- **Options**:
  - Use `RainbowButton` or `PulsatingButton` for stronger CTA
  - Add `AvatarCircles` + `Marquee` when real testimonials are available (code needs to be added fresh — old fake data was deleted)
  - Add `Confetti` trigger on CTA click for delight

### General
- Keep using `BlurFade` as the default entrance animation — it's consistent and performant
- Don't over-animate: pick 1-2 component upgrades per section max
- Test on mobile: some animations (Meteors, InteractiveGridPattern) may need reduced motion

## 5c. PatternCraft Atmosphere Backgrounds

Read [pattern-catalog.md](pattern-catalog.md) for the curated pattern list.

### Application Strategy

For each landing section, add a background pattern via wrapper div or inline style:

```tsx
// Example: adding pattern to hero section
<section
  className="relative ..."
  style={{
    backgroundImage: "radial-gradient(ellipse at 50% 0%, oklch(var(--primary) / 0.12), transparent 70%)",
  }}
>
```

### Section -> Pattern Mapping

| Section | Pattern Type | Goal |
|---------|-------------|------|
| Hero | Aurora / Radial Glow | Dramatic visual impact |
| Features | Dot Grid / Fine Lines | Subtle, non-distracting |
| HowItWorks | None or very subtle | Let timeline visuals dominate |
| CTA | Spotlight / Center Glow | Draw focus to CTA button |
| FAQ | None | Clean, readable |

### PatternCraft vs Magic UI Background Components

Both are available. Choose based on need:

| Need | Use |
|------|-----|
| Static atmosphere tint | PatternCraft CSS (lighter, no JS) |
| Animated/interactive bg | Magic UI: `Meteors`, `AnimatedGridPattern`, `DotPattern`, `Ripple` |
| Geometric pattern | PatternCraft (more variety: 250+ patterns) |
| Particle effects | Magic UI: `Meteors` |

**Recommendation**: Use PatternCraft CSS for subtle section backgrounds, Magic UI components for hero/CTA where animation adds value.

### Dark vs Light Mode

Patterns should work in both modes:
```css
/* Dark mode (default) — slightly more visible */
background-image: radial-gradient(ellipse at 50% 0%, var(--primary) / 0.12, transparent 70%);

/* Light mode — tone it down */
.light & { background-image: radial-gradient(ellipse at 50% 0%, var(--primary) / 0.06, transparent 70%); }
```

Or use Tailwind's dark: prefix if adding as className.

## 5d. Section Visibility Control

Based on product type, decide:
- **Show Showcase section?** — Uncomment if product has portfolio/gallery aspect
- **Show Models dropdown in nav?** — Only if multiple AI models exposed to users
- **Add social proof to CTA?** — Only when real testimonials exist. Add `AvatarCircles` + `Marquee` components with real data (no fake data exists in template)
- **Show Discord/GitHub links?** — Only if community exists

## Files to Modify

- `src/messages/en.json` — all landing-related keys
- `src/messages/zh.json` — all landing-related keys
- `src/components/landing/hero-section.tsx` — pattern background + optional component upgrades
- `src/components/landing/features-section.tsx` — pattern background + optional BentoGrid/MagicCard
- `src/components/landing/how-it-works-section.tsx` — optional pattern
- `src/components/landing/cta-section.tsx` — pattern background + optional button upgrade
- `src/components/landing/faq-section.tsx` — section content
- `src/components/landing/showcase-section.tsx` — uncomment if needed
- `src/components/landing/header.tsx` — navigation items
- `src/components/landing/footer.tsx` — footer links and description
