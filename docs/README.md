# VideoFly 文档中心

欢迎来到 VideoFly 项目文档中心。本文档提供了所有项目文档的导航和快速索引。

---

## 📚 文档分类

### 🚀 快速开始

- **[配置指南](./CONFIGURATION_GUIDE.md)** ⭐ **推荐首先阅读**
  - 环境变量配置
  - 价格和积分配置
  - AI 模型配置
  - 支付、存储、邮件、认证配置
  - 常见配置任务

### 💰 价格和积分

- **[价格方案参考](./spec/PRICING_REFERENCE.md)**
  - 定价策略和成本计算
  - 完整产品定价方案
  - 毛利率分析
  - 价格梯度分析

- **[积分计算系统](./spec/CREDIT_CALCULATOR.md)**
  - 前端积分计算
  - 后端积分验证
  - 添加新模型
  - 积分计算规则

### 🔌 API 集成

- **[API 集成指南](./API-INTEGRATION-GUIDE.md)**
  - evolink.ai API 集成
  - kie.ai API 集成
  - Creem 支付 API 集成
  - 统一 API 抽象层设计

- **[AI 提供商集成](./spec/AI_PROVIDER_INTEGRATION.md)**
  - AI 视频生成 API 集成架构
  - Provider 接口设计
  - 回调处理流程

### 🎨 组件和设计

- **[组件规范](./spec/COMPONENT_SPECIFICATION.md)**
  - 组件设计规范
  - UI/UX 标准

- **[仪表盘设计规范](./spec/DASHBOARD_DESIGN_SPEC.md)**
  - Dashboard 页面设计
  - 布局和交互规范

### 📧 邮件模板

- **[邮件模板文档](./spec/RESEND_EMAIL_TEMPLATES.md)**
  - 欢迎邮件
  - 密码重置邮件
  - Magic Link 邮件

### 🌐 其他设置

- **[代理设置](./PROXY_SETUP.md)**
  - 开发环境代理配置
  - 生产环境配置

### 🤖 AI 模型 API 文档

#### Kie.ai 模型

- [Sora 2 Text to Video](./API_KIE/sora-2-text-to-video.md)
- [Sora 2 Image to Video](./API_KIE/sora-2-image-to-video.md)
- [Veo 3.1](./API_KIE/veo-3-1.md)

#### Wan 2.6 模型

- [Wan 2.6 Text to Video](./API_KIE/wan/2-6-text-to-video.md)
- [Wan 2.6 Image to Video](./API_KIE/wan/2-6-image-to-video.md)
- [Wan 2.6 Video to Video](./API_KIE/wan/2-6-video-to-video.md)

#### Seedance 模型

- [Seedance 1.5 Pro](./API_KIE/bytedance/seedance-1-5-pro.md)

---

## 🎯 按场景查找文档

### 场景 1：新项目配置

如果你正在设置新的 VideoFly 实例，按以下顺序阅读：

1. **[配置指南](./CONFIGURATION_GUIDE.md)** - 了解所有配置项
2. **[价格方案参考](./spec/PRICING_REFERENCE.md)** - 理解定价策略
3. **[API 集成指南](./API-INTEGRATION-GUIDE.md)** - 配置外部服务

**核心配置文件**：
- `.env.local` - 环境变量
- `src/config/pricing-user.ts` - 价格和积分配置

### 场景 2：配置 Creem 支付

1. 阅读 **[配置指南 - 支付配置](./CONFIGURATION_GUIDE.md#4-支付配置)**
2. 在 Creem 后台创建产品
3. 复制 Product ID 到 `src/config/pricing-user.ts`
4. 配置 Webhook URL

**相关文档**：
- [配置指南 - 价格和积分配置](./CONFIGURATION_GUIDE.md#2-价格和积分配置)
- [API 集成指南 - Creem](./API-INTEGRATION-GUIDE.md#4-creem-支付-api-集成)

### 场景 3：添加新的 AI 模型

1. 阅读 **[积分计算系统](./spec/CREDIT_CALCULATOR.md)**
2. 查看对应模型的 API 文档（[API_KIE](./API_KIE/)）
3. 在 `src/config/pricing-user.ts` 中添加模型配置
4. 更新前端计算逻辑

### 场景 4：调整价格和积分

1. 阅读 **[价格方案参考](./spec/PRICING_REFERENCE.md)** - 了解定价策略
2. 编辑 `src/config/pricing-user.ts` - 修改价格和积分
3. 前端价格数据会自动更新（从 `pricing-user.ts` 生成）

**相关文档**：
- [配置指南 - 常见配置任务](./CONFIGURATION_GUIDE.md#-常见配置任务)
- [积分计算系统](./spec/CREDIT_CALCULATOR.md)

### 场景 5：集成新的 AI 提供商

1. 阅读 **[AI 提供商集成](./spec/AI_PROVIDER_INTEGRATION.md)**
2. 阅读 **[API 集成指南 - 统一抽象层](./API-INTEGRATION-GUIDE.md#5-统一-api-抽象层设计)**
3. 实现新的 Provider 类
4. 在 `src/ai/index.ts` 中注册

---

## 🔑 核心配置文件速查

| 文件 | 用途 | 相关文档 |
|------|------|----------|
| `.env.local` | 环境变量 | [配置指南 - 环境变量](./CONFIGURATION_GUIDE.md#1-环境变量配置) |
| `src/config/pricing-user.ts` | 价格和积分配置 | [配置指南 - 价格配置](./CONFIGURATION_GUIDE.md#2-价格和积分配置) |
| `src/lib/storage.ts` | 存储配置 | [配置指南 - 存储配置](./CONFIGURATION_GUIDE.md#5-存储配置) |
| `src/lib/auth/auth.ts` | 认证配置 | [配置指南 - 认证配置](./CONFIGURATION_GUIDE.md#7-认证配置) |
| `src/ai/` | AI 提供商 | [AI 提供商集成](./spec/AI_PROVIDER_INTEGRATION.md) |
| `src/services/credit.ts` | 积分系统 | [积分计算系统](./spec/CREDIT_CALCULATOR.md) |

---

## 📋 配置清单

### 新项目部署清单

使用以下清单确保所有配置正确：

#### 环境变量 (`.env.local`)

- [ ] 数据库连接 (`DATABASE_URL`)
- [ ] 应用 URL (`NEXT_PUBLIC_APP_URL`)
- [ ] Better Auth Secret (`BETTER_AUTH_SECRET`)
- [ ] Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [ ] AI 提供商 API Keys (`EVOLINK_API_KEY`, `KIE_API_KEY`)
- [ ] 回调 URL (`AI_CALLBACK_URL`, `CALLBACK_HMAC_SECRET`)
- [ ] 存储配置 (`STORAGE_*`)
- [ ] Creem 配置 (`CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`)
- [ ] 邮件配置 (`RESEND_API_KEY`, `RESEND_FROM`)
- [ ] 管理员邮箱 (`ADMIN_EMAIL`)

#### 价格和积分配置 (`src/config/pricing-user.ts`)

- [ ] 新用户赠送积分 (`NEW_USER_GIFT`)
- [ ] 积分过期设置 (`CREDIT_EXPIRATION`)
- [ ] 订阅产品配置 (`SUBSCRIPTION_PRODUCTS`)
  - [ ] 在 Creem 创建产品
  - [ ] 复制 Product ID
  - [ ] 更新 `id` 字段
- [ ] 积分包配置 (`CREDIT_PACKAGES`)
  - [ ] 在 Creem 创建产品
  - [ ] 复制 Product ID
  - [ ] 更新 `id` 字段
- [ ] AI 模型积分配置 (`VIDEO_MODEL_PRICING`)

#### Creem 后台配置

- [ ] 创建 6 个订阅产品（月付×3，年付×3）
- [ ] 创建 3 个积分包产品
- [ ] 设置产品价格和描述
- [ ] 配置 Webhook URL: `https://your-domain.com/api/auth/creem/webhook`

---

## 🆘 获取帮助

### 文档问题

如果你在文档中发现问题或需要补充：

1. **配置不清晰**：在 [配置指南](./CONFIGURATION_GUIDE.md) 中查找
2. **不理解定价**：查看 [价格方案参考](./spec/PRICING_REFERENCE.md)
3. **API 集成问题**：参考 [API 集成指南](./API-INTEGRATION-GUIDE.md)

### 常见问题

**Q: 我应该从哪里开始？**

A: 从 [配置指南](./CONFIGURATION_GUIDE.md) 开始，它涵盖了所有主要配置。

**Q: 如何修改价格？**

A: 直接编辑 `src/config/pricing-user.ts`，前端会自动更新。详见 [配置指南 - 常见配置任务](./CONFIGURATION_GUIDE.md#-常见配置任务)。

**Q: Creem Product ID 在哪里配置？**

A: 在 `src/config/pricing-user.ts` 的 `SUBSCRIPTION_PRODUCTS` 和 `CREDIT_PACKAGES` 中配置。详见 [配置指南 - 价格和积分配置](./CONFIGURATION_GUIDE.md#2-价格和积分配置)。

**Q: 如何添加新的 AI 模型？**

A: 参考 [积分计算系统](./spec/CREDIT_CALCULATOR.md#添加新模型)。

**Q: Webhook URL 是什么？**

A: `https://your-domain.com/api/auth/creem/webhook`，在 Creem Dashboard 中配置。

---

## 📝 文档维护

### 文档结构原则

- **主配置文档**：`CONFIGURATION_GUIDE.md` - 所有配置的中心入口
- **附属文档**：具体主题的详细说明（定价、积分计算等）
- **参考文档**：API 文档、设计规范等

### 更新文档

当修改项目配置时，记得同步更新相关文档：

1. 修改 `pricing-user.ts` → 更新 [价格方案参考](./spec/PRICING_REFERENCE.md)
2. 添加新 AI 模型 → 更新 [积分计算系统](./spec/CREDIT_CALCULATOR.md)
3. 修改环境变量 → 更新 [配置指南](./CONFIGURATION_GUIDE.md)

---

*最后更新：2026-02-02*
