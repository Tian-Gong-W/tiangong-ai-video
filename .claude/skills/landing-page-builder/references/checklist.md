# Landing Page 交付验收清单

完成开发后，逐项检查并输出交付报告。

## 文件变更

- [ ] 所有新建/修改的文件已列出
- [ ] 未改动禁止范围内的文件（auth、payment、API、数据库、middleware）
- [ ] 组件文件位置正确：首页在 `landing/`，子页面在 `landing/<slug>/`

## i18n

- [ ] `src/messages/en.json` 已更新
- [ ] `src/messages/zh.json` 已更新
- [ ] 所有用户可见文案均通过 `useTranslations()` 引用，无硬编码文本
- [ ] 中英文案无遗漏的 TODO 或 placeholder 标记

## 占位资源

- [ ] 图片使用 `picsum.photos/seed/<slug>/宽/高` 确定性占位
- [ ] 视频 `videoUrl` 字段留空或设为空字符串
- [ ] 视频缩略图使用占位图
- [ ] 交付报告中列出所有需要替换的占位资源位置

## 视觉质量

- [ ] Light 模式下所有文本可读（对比度 >= 4.5:1）
- [ ] Dark 模式下所有文本可读
- [ ] 卡片/区块边框在两种模式下均可见
- [ ] 无跨色系渐变（如 blue-to-purple）
- [ ] 同一 section 内颜色种类 <= 2（主色 + 辅助色）
- [ ] 标题无渐变文字

## 组件与交互

- [ ] 首页/模型页 Hero 包含 VideoGeneratorInput（如适用）
- [ ] 模型页 VideoGeneratorInput 默认模型已设为对应模型
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 按钮 hover 有视觉反馈
- [ ] 动画使用 `BlurFade` 等项目已有组件，无自定义动画引入

## 响应式

- [ ] 375px (手机) 布局正常，无横向滚动
- [ ] 768px (平板) 布局正常
- [ ] 1024px (小屏笔记本) 布局正常
- [ ] 1440px (桌面) 布局正常

## 构建验证

- [ ] `pnpm build` 通过，无 TypeScript 错误
- [ ] 无 ESLint 报错

## 交付报告模板

完成验收后，输出以下格式的报告：

```
## 交付报告

### 变更清单
| 文件 | 操作 | 说明 |
|------|------|------|
| src/components/landing/xxx.tsx | 新建 | Hero 区域组件 |
| src/messages/en.json | 修改 | 新增 Xxx 命名空间 |
| ... | ... | ... |

### 需要替换的占位资源
| 文件 | 位置 | 类型 | 说明 |
|------|------|------|------|
| xxx-section.tsx | videos[0].videoUrl | 视频 | 替换为真实视频 URL |
| xxx-section.tsx | videos[0].thumbnailUrl | 图片 | 替换为真实缩略图 |
| ... | ... | ... | ... |

支持的视频格式：MP4/WebM 直链、YouTube/Vimeo 嵌入链接、Cloudflare Stream

### 建议后续
- [ ] 替换占位图片为真实产品截图
- [ ] 替换占位视频为真实演示视频
- [ ] 生成 OG 分享图片
- [ ] 配置页面 SEO metadata
```
