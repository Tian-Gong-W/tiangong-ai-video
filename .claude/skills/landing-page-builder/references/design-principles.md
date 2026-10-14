# Landing Page Design Principles

## Anti-AI Aesthetic Rules (CRITICAL)

These rules are NON-NEGOTIABLE. Every landing page must follow them:

### Color Discipline
- **Single primary color** per module/section. Never mix 3+ hue families in one section
- **No rainbow gradients**. If gradient is needed, use same-hue gradients (e.g., emerald-400 to emerald-700)
- **Cross-hue gradients are banned** unless explicitly requested (e.g., `from-blue-500 to-purple-500`)
- Use the project's existing theme colors (`bg-primary`, `text-primary`, `bg-muted`, etc.)
- Accent colors should be used sparingly — one accent per page max

### Typography Discipline
- Max 2 font families per page (heading + body)
- No "AI-style" oversized gradient text blocks
- Prefer solid color headings over gradient text
- Subtitle/description text should be `text-muted-foreground`, not colored

### Layout Discipline
- Generous whitespace between sections (`py-20 md:py-28` minimum)
- Consistent container width across all sections (`container mx-auto`)
- No more than 3 visual effects per section (e.g., blur + border + shadow is fine, adding glow + gradient + beam is too much)

### Animation Discipline
- Prefer `BlurFade` for entrance animations — subtle and professional
- Avoid staggered animations with too many items (max 4-6 staggered elements)
- No parallax + scroll-trigger + hover + border-beam all in one component
- `prefers-reduced-motion` must be respected

## Video Module Design (AI Video Products)

When the product is related to AI video generation:

### Video Placeholder Pattern
```tsx
// Video card with placeholder - clickable to play
<div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group cursor-pointer">
  {/* Placeholder thumbnail */}
  <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />

  {/* Play button overlay */}
  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
      <Play className="h-5 w-5 text-foreground ml-0.5" />
    </div>
  </div>

  {/* Optional: tag badge */}
  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-black/50 text-white backdrop-blur-sm">
    {tag}
  </span>
</div>
```

### Video Data Structure
```tsx
const videos = [
  {
    id: "1",
    title: "Example Title",
    description: "Brief description",
    thumbnailUrl: "https://picsum.photos/seed/sora-video-1/640/360",  // 确定性占位
    videoUrl: "",  // PLACEHOLDER — 用户替换为真实视频 URL
    tag: "Text to Video",
  },
];
```

## Image Placeholder Standard

所有占位图片使用 picsum.photos 确定性 URL，确保每次构建结果一致。

### URL 格式
```
https://picsum.photos/seed/<seed>/<width>/<height>
```

### Seed 命名规则
`<页面slug>-<用途>`，slug 中的 `/` 替换为 `-`

| 用途 | seed 示例 | 尺寸 |
|------|----------|------|
| Hero 背景 | `sora-hero` | 1600x900 |
| Hero 配图 | `sora-hero-image` | 1200x800 |
| Feature 配图 | `sora-feature-1` | 800x600 |
| Showcase 缩略图 | `sora-showcase-1` | 640x360 |
| 团队头像 | `sora-avatar-1` | 200x200 |
| Logo 占位 | `sora-logo-1` | 120x40 |

### 禁止行为
- 不使用随机 unsplash 链接（每次构建结果不同）
- 不在 `public/` 下放真实产品图片（交付后由用户替换）
- 不使用 base64 内联图片

### Post-Design Video Replacement Prompt
After completing the landing page design, ALWAYS output this reminder:

```
Video placeholders that need your real video URLs:
- src/components/landing/showcase-section.tsx: Replace `thumbnailUrl` and `videoUrl` in the `videos` array
- [List any other files with video placeholders]

You can use:
- Direct MP4/WebM URLs
- YouTube/Vimeo embed URLs
- Cloudflare Stream URLs
```

## Section Module Catalog

Common landing page sections (pick and arrange based on content):

| Module | Purpose | When to Use |
|--------|---------|-------------|
| Hero | First impression, main CTA | Always |
| Features | Product capabilities | Core product info |
| Showcase/Gallery | Visual demos, video examples | Visual products (AI video, design tools) |
| How It Works | Process steps (3-5 steps) | When process needs explanation |
| Pricing | Plans and pricing | SaaS products |
| Testimonials | Social proof | Established products |
| FAQ | Address objections | Always recommended |
| CTA | Final conversion push | Always at bottom |
| Comparison | vs competitors | When differentiation matters |
| Stats/Numbers | Credibility metrics | When data is available |

## Component Library Reference

Use components from the project's component library:

### Available UI Components
- `@/components/ui/*` — shadcn/ui basics (Button, Card, Badge, etc.)
- `@/components/magicui/*` — Animations (BlurFade, BorderBeam, ShimmerButton, HeroVideoDialog, etc.)
- `@/components/animate-ui/*` — Number animations, writing effects

### Key Components for Landing Pages
- `BlurFade` — Section entrance animation
- `BorderBeam` — Subtle border glow (use sparingly, 1-2 per page)
- `ShimmerButton` — Primary CTA button
- `HeroVideoDialog` — Video preview modal
- `Marquee` — Logo scroll / testimonial scroll
- `BentoGrid` — Feature grid layout
- `AvatarCircles` — Social proof avatars

### i18n Pattern
All user-visible text must use `next-intl`:
```tsx
const t = useTranslations("SectionName");
// Then use t("key") for all text
```
Update both `src/messages/en.json` and `src/messages/zh.json`.
