---
name: landing-page-builder
description: >
  Landing page 内容策划与开发。通过参考网址或文本素材，分析提炼内容，规划页面模块结构，
  用户确认后再进行设计开发。支持新建页面和修改现有页面两种模式。
  强调降低 AI 味、克制用色、视频类产品自带视频展示模块。
  触发词：「改 landing page」「优化首页」「重做落地页」「landing page redesign」
  「redesign homepage」「rebuild landing」「修改首页」「首页改版」「落地页开发」
  「模型落地页」「model landing page」「新建落地页」「add landing page」。
---

# Landing Page Builder

根据参考素材策划 landing page 内容结构，用户确认后再设计开发。
支持**新建页面**和**修改现有页面**两种模式。

## 编辑范围（硬性限制）

### 允许操作
- 创建/修改 `src/components/landing/` 下的组件
- 创建/修改 `src/app/[locale]/(marketing)/` 下的页面文件
- 更新 `src/messages/en.json` 和 `src/messages/zh.json` 的 i18n 内容
- 更新 `src/styles/globals.css` 的样式（仅新增动画或微调）
- 在 `public/` 下添加占位图片

### 禁止操作
- 不改 `src/lib/auth/`、`src/services/`、`src/payment/` 等业务逻辑
- 不改 `src/db/`、`src/api/` 等后端代码
- 不改 `src/components/video-generator/` 的内部实现（只引用）
- 不改 `src/middleware.ts`、`src/config/` 下的非 i18n 配置
- 不改环境变量或 `.env` 文件

## 工作流程 (5 步)

### Step 0: 判断模式

根据用户意图判断：

**新建页面** — 用户要创建一个不存在的落地页（如模型专属页 `/sora`）
**修改页面** — 用户要优化/重做已有的落地页（如首页 `/`）

判断依据：
- 用户提到「新建」「新增」「创建」「add」「create」→ 新建模式
- 用户提到「改」「优化」「重做」「redesign」→ 修改模式
- 不确定时主动询问用户

### Step 1: 收集参考素材 — 需要用户输入

用户提供以下至少一种输入：

| 输入方式 | 说明 |
|----------|------|
| 参考网址 (1-5 个) | 用 `WebFetch` 或 `baoyu-url-to-markdown` 抓取内容 |
| Markdown/文本 | 直接提供产品描述、功能、FAQ 等 |

**同时自动执行：**
- 读取 `src/styles/globals.css` 获取当前主题色
- 用通俗语言告知用户当前配色（如「深绿色」「靛蓝色」「珊瑚红」），不要只给色号
- 除非用户指定新配色，否则沿用现有配色

**修改模式额外操作：**
- 读取现有页面的所有组件代码（`src/components/landing/*.tsx`）
- 读取现有 i18n 消息，理解当前页面结构和内容
- 对比参考素材，识别需要调整的部分

**从参考素材中提取：**
- 页面模块排列顺序
- 文案风格和调性
- 核心卖点和价值主张
- 功能列表及描述
- 社会证明（客户评价、数据、Logo 墙）
- CTA 策略（位置、文案、频率）

### Step 2: 输出内容编排方案 — 阻塞等待用户确认

基于模式不同，输出方案的侧重点不同：

#### 新建模式方案

```
## Landing Page 内容方案（新建）

### 当前配色
- 主色：[用通俗颜色名描述，如「深绿色」]
- 如需更换请告知，否则沿用现有配色

### 页面信息
- 路由：[如 /sora、/features/text-to-video]
- 页面类型：首页 / 模型专属页 / 其他落地页

### 页面结构
1. Header — [导航项, CTA 按钮]
2. Hero — [主标题, 副标题, 主 CTA, 是否含 VideoGeneratorInput]
3. Features — [3-4 个功能卡片]
4. Showcase — [视频展示区域]
...

### 各模块详细内容
[中英双语文案]

### 设计方向
- 风格 / 主色 / 核心视觉 / 动画级别
```

#### 修改模式方案

```
## Landing Page 修改方案

### 当前配色
- 主色：[通俗颜色名]

### 现有页面结构
[列出当前所有 section 及其组件文件]

### 修改计划
| 模块 | 操作 | 变更说明 |
|------|------|----------|
| Hero | 保留 | 仅更新文案 |
| Features | 重写 | 从 4 栏改为 3 栏，新增参考生成 |
| Showcase | 新增 | 添加视频展示区域 |
| FAQ | 微调 | 更新 2 个问题 |

### 新增/修改的文案内容
[中英双语，仅列出变更部分]

### 设计调整
- [列出具体的设计变更]
```

**必须等用户确认后才进入 Step 3。**

### Step 3: 设计系统生成 — 自动执行

1. 如有 ui-ux-pro-max skill，运行设计系统生成器：
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<产品关键词>" --design-system -p "项目名"
```

2. 读取 `src/styles/globals.css` 确保配色一致

3. 读取 `docs/spec/COMPONENT_SPECIFICATION.md` 了解可用组件

4. 加载设计原则：
   → [references/design-principles.md](references/design-principles.md)

### Step 4: 开发实现 — 自动执行

加载详细工作流：
→ [references/workflow-steps.md](references/workflow-steps.md)

**新建模式**：先创建页面骨架（路由文件 + 空组件 + i18n key），再填充内容
**修改模式**：基于现有代码逐个组件修改，保留未变更的部分

### Step 5: 验证与交付 — 自动执行

加载验收清单：
→ [references/checklist.md](references/checklist.md)

输出交付报告。

## Hero 区域 VideoGeneratorInput 组件规则

### 首页 Hero
默认包含 `VideoGeneratorInput` 组件，除非用户明确要求替换。

```tsx
import { VideoGeneratorInput } from "@/components/video-generator";
<VideoGeneratorInput credits={credits} onSubmit={handleGenerate} />
```

### 模型专属落地页
Hero 包含 `VideoGeneratorInput`，通过 `defaults` 设置默认模型：

```tsx
<VideoGeneratorInput
  defaults={{ generationType: "video", videoModel: "sora-2" }}
  credits={credits}
  onSubmit={handleGenerate}
/>
```

可通过 `config` 限制模型列表：

```tsx
<VideoGeneratorInput
  config={{ videoModels: [currentModel] }}
  defaults={{ videoModel: currentModel.id }}
  credits={credits}
  onSubmit={handleGenerate}
/>
```

### 其他落地页
不强制包含 VideoGeneratorInput，使用普通 Hero 设计。

## 配色策略

- 默认沿用现有配色，Step 1 时用通俗语言主动告知用户
- 所有组件使用语义 token（`bg-primary`、`text-primary-foreground` 等），不硬编码色值
- 换色参考 videofly-init skill 的 Step 3 主题配色流程

## 核心设计约束

### 降低 AI 味道（强制）
- 同一模块只用 1 种主色，禁止跨色系渐变（如 blue-to-purple）
- 同一页面最多 1 种强调色
- 标题用纯色，不用渐变文字
- 副标题/描述统一用 `text-muted-foreground`
- 每个区块最多 3 种视觉效果

### 占位资源标准
- **视频**：缩略图 + Play 按钮，`videoUrl: ""` 留空，交付时提示替换
- **图片**：使用 `https://picsum.photos/seed/<slug>/宽/高` 确定性占位图
  - seed 命名规则：`<页面slug>-<section名>`，如 `sora-hero`、`sora-feature-1`
  - 不要用随机图片，确保每次构建结果一致

### 技术规范
- 所有文案通过 next-intl 国际化
- 使用语义色彩 token
- 支持 light/dark 双模式
- 编辑前必须先读取文件
