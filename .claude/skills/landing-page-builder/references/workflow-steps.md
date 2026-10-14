# Landing Page Builder — 开发实现详细工作流

## 判断模式后的执行路径

### 新建模式：先建骨架再填充

#### 1. 创建页面骨架

**路由文件**：
```
src/app/[locale]/(marketing)/<route>/page.tsx
```

骨架模板：
```tsx
import { HeroSection } from "@/components/landing/<slug>/hero-section";
import { FeaturesSection } from "@/components/landing/<slug>/features-section";
// ... 其他 section imports

export default function Page() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      {/* 其他 sections */}
    </>
  );
}
```

**组件文件**（每个 section 一个文件）：
```
src/components/landing/<slug>/hero-section.tsx
src/components/landing/<slug>/features-section.tsx
src/components/landing/<slug>/showcase-section.tsx
...
```

如果是首页（`/`），组件放在 `src/components/landing/` 根目录。
如果是子页面（如 `/sora`），组件放在 `src/components/landing/<slug>/` 子目录。

**i18n 骨架**：
在 `src/messages/en.json` 和 `src/messages/zh.json` 中添加页面对应的 namespace。

#### 2. 填充内容

按 Step 2 确认的方案，逐个组件填充：
- i18n 消息 → 组件代码 → 页面布局 → 样式微调

### 修改模式：基于现有代码逐步改

#### 1. 读取现有代码

- 读取页面文件，了解当前 section 引用顺序
- 逐个读取被修改的组件文件
- 读取相关 i18n 消息

#### 2. 按修改计划执行

根据 Step 2 确认的修改计划表：
- **保留**的模块：不改代码，最多更新 i18n 文案
- **微调**的模块：小范围 Edit，如改类名、调布局
- **重写**的模块：读取原文件后用 Write 覆盖
- **新增**的模块：创建新组件文件，在页面文件中添加引用
- **删除**的模块：从页面文件移除引用（组件文件保留，避免破坏其他引用）

#### 3. 保持一致性

修改部分必须与未修改部分在风格上保持一致：
- 同样的 section 间距（`py-20 md:py-28` 或现有间距）
- 同样的容器宽度
- 同样的动画库和入场方式

## 实现顺序（两种模式通用）

1. **更新 i18n 消息**（`src/messages/en.json`, `src/messages/zh.json`）
2. **创建/修改组件**（`src/components/landing/`）
3. **更新页面布局**（路由文件）
4. **检查 light/dark 模式**
5. **验证响应式**（375px / 768px / 1024px / 1440px）

## 实现规则

- 编辑前必须先读取文件
- 使用语义色彩 token（`bg-background`, `text-foreground`, `bg-card` 等）
- 遵循项目现有代码风格
- 支持 light/dark 双模式
- 所有文案通过 next-intl 国际化
- 视频区域使用占位模式（见 design-principles.md）
- 图片使用 picsum.photos 确定性占位（见 design-principles.md）

## 占位图使用规范

### 图片占位
使用确定性 URL，确保构建一致：

```
https://picsum.photos/seed/<seed>/<width>/<height>
```

seed 命名规则：`<页面slug>-<用途>`
- Hero 背景：`sora-hero` → `https://picsum.photos/seed/sora-hero/1600/900`
- Feature 配图：`sora-feature-1` → `https://picsum.photos/seed/sora-feature-1/800/600`
- Showcase 缩略图：`sora-showcase-1` → `https://picsum.photos/seed/sora-showcase-1/640/360`

slug 中有 `/` 时替换为 `-`（如 `features/text-to-video` → `features-text-to-video-hero`）

### 视频占位
```tsx
const videos = [
  {
    id: "1",
    title: "示例标题",
    thumbnailUrl: "https://picsum.photos/seed/sora-video-1/640/360",  // 占位缩略图
    videoUrl: "",  // PLACEHOLDER — 用户替换为真实视频 URL
    tag: "Text to Video",
  },
];
```
