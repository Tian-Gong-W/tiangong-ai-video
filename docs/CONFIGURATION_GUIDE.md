# VideoFly 配置指南

本文档是 VideoFly 项目的主要配置指南，涵盖了所有核心配置文件的说明和修改方法。

---

## 📑 目录

1. [环境变量配置](#1-环境变量配置)
2. [价格和积分配置](#2-价格和积分配置)
3. [AI 模型配置](#3-ai-模型配置)
4. [支付配置](#4-支付配置)
5. [存储配置](#5-存储配置)
6. [邮件配置](#6-邮件配置)
7. [认证配置](#7-认证配置)

---

## 1. 环境变量配置

### 文件位置
`.env.local`（开发环境）或生产环境变量

### 核心环境变量

```bash
# ============================================
# 数据库配置
# ============================================
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# ============================================
# 应用配置
# ============================================
NEXT_PUBLIC_APP_URL=https://videofly.app  # 生产环境域名
NEXT_PUBLIC_BILLING_PROVIDER=creem        # 支付提供商

# ============================================
# 认证配置
# ============================================
BETTER_AUTH_SECRET=your_secret_key        # 使用 openssl rand -base64 32 生成
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============================================
# AI 提供商配置
# ============================================
EVOLINK_API_KEY=your_evolink_api_key
KIE_API_KEY=your_kie_api_key
DEFAULT_AI_PROVIDER=evolink

# 回调配置（生产环境必须配置）
AI_CALLBACK_URL=https://videofly.app/api/v1/video/callback
CALLBACK_HMAC_SECRET=your_callback_secret_for_hmac

# ============================================
# 存储配置（R2/S3）
# ============================================
STORAGE_ENDPOINT=https://your-r2-endpoint.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
STORAGE_BUCKET=videofly
STORAGE_DOMAIN=https://pub-xxx.r2.dev

# ============================================
# 支付配置（Creem）
# ============================================
CREEM_API_KEY=creem_live_xxx
CREEM_WEBHOOK_SECRET=creem_webhook_secret

# ============================================
# 邮件配置（Resend）
# ============================================
RESEND_API_KEY=re_xxx
RESEND_FROM=support@videofly.app

# ============================================
# 管理员账号
# ============================================
ADMIN_EMAIL=admin@videofly.app

# ============================================
# 分析配置（可选）
# ============================================
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### ⚠️ 重要说明

1. **积分配置已迁移**：Creem Product ID 现在直接在 `src/config/pricing-user.ts` 中配置，无需在环境变量中设置
2. **Secret 生成**：使用 `openssl rand -base64 32` 生成安全的 secret
3. **生产环境**：AI_CALLBACK_URL 必须使用生产域名

---

## 2. 价格和积分配置

### 主配置文件
**文件位置**：`src/config/pricing-user.ts`

这是价格和积分系统的**唯一配置文件**，所有订阅和积分包的配置都在这里管理。

### 配置结构

```typescript
// ============================================
// 一、基础设置
// ============================================

/** 新用户注册赠送积分 */
export const NEW_USER_GIFT = {
  enabled: true,
  credits: 2,        // 赠送积分数量
  validDays: 30,     // 积分有效期（天）
};

/** 积分过期设置 */
export const CREDIT_EXPIRATION = {
  subscriptionDays: 30,   // 订阅积分有效期
  purchaseDays: 365,      // 一次性购买积分有效期
  warnBeforeDays: 7,      // 提前多少天提醒过期
};

// ============================================
// 二、订阅产品配置
// ============================================

export const SUBSCRIPTION_PRODUCTS = [
  {
    id: "prod_xxx",              // Creem Product ID（必填）
    name: "Basic Plan",
    priceUsd: 9.9,               // 价格（美元）
    credits: 280,                // 每周期积分
    period: "month",             // "month" 或 "year"
    popular: false,              // 是否推荐
    enabled: true,               // 是否启用
    features: ["hd_videos", "fast_generation"],
  },
  // ... 更多产品
];

// ============================================
// 三、一次性购买积分包
// ============================================

export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  {
    id: "prod_xxx",
    name: "Starter Pack",
    priceUsd: 14.9,
    credits: 280,
    popular: false,
    enabled: true,
    allowFreeUser: true,         // 是否允许免费用户购买
    features: ["hd_videos", "fast_generation"],
  },
  // ... 更多积分包
];

// ============================================
// 四、AI 模型积分计费
// ============================================

export const VIDEO_MODEL_PRICING: Record<string, VideoModelPricing> = {
  "veo-3.1": {
    baseCredits: 10,
    perSecond: 0,
    enabled: true,
  },
  // ... 更多模型
};
```

### 🔄 Creem 产品配置流程

#### 步骤 1：在 Creem 后台创建产品

1. 登录 [Creem Dashboard](https://dashboard.creem.io)
2. 创建订阅产品（Subscription）或一次性产品（One-time）
3. 设置产品名称、价格、描述等

#### 步骤 2：复制 Product ID

在产品列表中，复制每个产品的 Product ID（格式：`prod_xxx`）

#### 步骤 3：更新配置文件

将 Product ID 填入 `src/config/pricing-user.ts` 对应产品的 `id` 字段：

```typescript
export const SUBSCRIPTION_PRODUCTS = [
  {
    id: "prod_4yNyvLWQ88n8AqJj35uOvK", // ← 粘贴 Product ID
    name: "Basic Plan",
    // ... 其他配置
  },
];
```

#### 步骤 4：配置 Webhook

在 Creem Dashboard 中设置 Webhook URL：
```
https://videofly.app/api/auth/creem/webhook
```

### 📊 当前价格方案

详见：[价格参考文档](./spec/PRICING_REFERENCE.md)

#### 订阅计划

| 计划 | 月付 | 年付 | 月积分 | 年积分 |
|------|------|------|--------|--------|
| Basic | $9.90 | $99 | 280 | 3,360 |
| Pro | $29.90 | $299 | 960 | 11,520 |
| Ultimate | $79.90 | $799 | 2,850 | 34,200 |

#### 积分包

| 名称 | 价格 | 积分 | 限制 |
|------|------|------|------|
| Starter Pack | $14.90 | 280 | 所有用户 |
| Standard Pack | $39.90 | 960 | 仅订阅用户 |
| Pro Pack | $99.90 | 2,850 | 仅订阅用户 |

---

## 3. AI 模型配置

### 配置文件
**文件位置**：`src/config/pricing-user.ts`（VIDEO_MODEL_PRICING 部分）

### 支持的模型

| 模型 ID | 名称 | 积分规则 | 状态 |
|---------|------|----------|------|
| veo-3.1 | Veo 3.1 Fast Lite | 固定 10 积分 | ✅ 启用 |
| sora-2 | Sora 2 Lite | 10s=2积分, 15s=3积分 | ✅ 启用 |
| wan2.6 | Wan 2.6 | 5s起，每秒 5 积分 | ✅ 启用 |
| seedance-1.5-pro | Seedance 1.5 Pro | 按秒计费，720p=4积分/秒 | ✅ 启用 |

### 添加新模型

```typescript
export const VIDEO_MODEL_PRICING: Record<string, VideoModelPricing> = {
  // ... 现有模型

  "new-model": {
    baseCredits: 10,              // 基础积分
    perSecond: 2,                 // 每秒积分（可选）
    qualityMultiplier: 1.5,       // 高清乘数（可选）
    enabled: true,
  },
};
```

详见：[积分计算系统说明](./spec/CREDIT_CALCULATOR.md)

---

## 4. 支付配置

### Creem（主要支付提供商）

#### 环境变量

```bash
CREEM_API_KEY=creem_live_xxx
CREEM_WEBHOOK_SECRET=whsec_xxx
```

#### Better Auth 集成

Creem 通过 Better Auth 插件自动处理支付流程：

```typescript
// src/lib/auth/auth.ts
import { creem } from "@creem_io/better-auth";

export const auth = betterAuth({
  plugins: [
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
      testMode: process.env.NODE_ENV !== "production",
      persistSubscriptions: true,

      // 支付成功回调（自动充值积分）
      onGrantAccess: async ({ customer, product }) => {
        // 根据产品 ID 充值对应积分
        const pricingConfig = getProductById(product.id);
        if (pricingConfig) {
          await creditService.recharge({
            userId: customer.userId,
            credits: pricingConfig.credits,
            orderNo: `creem_${product.id}`,
            transType: "ORDER_PAY",
          });
        }
      },
    }),
  ],
});
```

#### 客户端使用

```typescript
import { creem } from "@/lib/auth-client";

// 创建支付会话
const { data } = await creem.createCheckout({
  productId: "prod_xxx",
  successUrl: "/dashboard?payment=success",
  cancelUrl: "/pricing",
});

// 重定向到支付页面
window.location.href = data.checkoutUrl;

// 打开订阅管理门户
const { data: portalData } = await creem.createPortal();
window.location.href = portalData.portalUrl;
```

详见：[API 集成指南 - Creem](./API-INTEGRATION-GUIDE.md#4-creem-支付-api-集成)

### Stripe（备用支付提供商）

#### 环境变量

```bash
STRIPE_API_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

详见：[API 集成指南](./API-INTEGRATION-GUIDE.md)

---

## 5. 存储配置

### R2/S3 存储

用于存储生成的视频文件。

#### 环境变量

```bash
STORAGE_ENDPOINT=https://xxx.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
STORAGE_BUCKET=videofly
STORAGE_DOMAIN=https://pub-xxx.r2.dev
```

#### 使用方式

```typescript
import { storageService } from "@/lib/storage";

// 上传文件
const url = await storageService.upload(file, "videos/video-uuid.mp4");

// 生成预签名 URL
const signedUrl = await storageService.getSignedUrl("videos/video-uuid.mp4", 3600);

// 删除文件
await storageService.delete("videos/video-uuid.mp4");
```

---

## 6. 邮件配置

### Resend

用于发送用户注册、密码重置等邮件。

#### 环境变量

```bash
RESEND_API_KEY=re_xxx
RESEND_FROM=support@videofly.app
```

#### 邮件模板

详见：[邮件模板文档](./spec/RESEND_EMAIL_TEMPLATES.md)

---

## 7. 认证配置

### Better Auth

#### 社交登录

支持 Google OAuth：

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### Magic Link

基于邮箱的密码less登录：

```typescript
import { authClient } from "@/lib/auth-client";

// 发送 Magic Link
await authClient.magicLink.send({
  email: "user@example.com",
  callbackURL: "/dashboard",
});
```

---

## 🔧 常见配置任务

### 修改价格

直接编辑 `src/config/pricing-user.ts`：

```typescript
{
  id: "prod_xxx",
  name: "Basic Plan",
  priceUsd: 12.9,  // ← 修改价格
  credits: 300,     // ← 修改积分
  // ...
}
```

### 修改新用户赠送积分

```typescript
export const NEW_USER_GIFT = {
  enabled: true,
  credits: 10,  // ← 修改赠送积分
  validDays: 30,
};
```

### 添加新的积分包

```typescript
export const CREDIT_PACKAGES = [
  // 现有积分包...
  {
    id: "prod_new_pack",  // 从 Creem 后台复制
    name: "New Pack",
    priceUsd: 19.9,
    credits: 500,
    enabled: true,
    allowFreeUser: true,
    features: ["hd_videos"],
  },
];
```

### 禁用某个产品

```typescript
{
  id: "prod_xxx",
  enabled: false,  // ← 设为 false 禁用
  // ...
}
```

### 修改积分过期时间

```typescript
export const CREDIT_EXPIRATION = {
  subscriptionDays: 30,   // 订阅积分有效期
  purchaseDays: 365,      // 购买积分有效期
  warnBeforeDays: 7,      // 提前提醒天数
};
```

---

## 📚 相关文档

- [价格参考文档](./spec/PRICING_REFERENCE.md) - 完整的价格方案和计算说明
- [积分计算系统](./spec/CREDIT_CALCULATOR.md) - 如何计算视频生成的积分消耗
- [API 集成指南](./API-INTEGRATION-GUIDE.md) - Creem 和 Stripe 支付集成
- [AI 提供商集成](./spec/AI_PROVIDER_INTEGRATION.md) - AI 视频生成 API 集成
- [邮件模板](./spec/RESEND_EMAIL_TEMPLATES.md) - 邮件模板配置

---

## ⚠️ 注意事项

1. **配置修改后生效**：大部分配置修改后需要重启开发服务器
   ```bash
   # Ctrl+C 停止服务器，然后重新启动
   pnpm dev
   ```

2. **生产环境变量**：确保生产环境的所有环境变量都已正确配置

3. **Creem Product ID**：
   - 必须在 Creem 后台创建产品后才能获得
   - 创建后复制 Product ID 到 `pricing-user.ts`
   - Product ID 格式：`prod_xxx`

4. **积分计算一致性**：前端和后端的积分计算逻辑必须保持一致

5. **Webhook URL**：确保在 Creem Dashboard 中配置了正确的 Webhook URL

---

## 🆘 获取帮助

如果遇到配置问题：

1. 检查相关文档的"常见问题"部分
2. 查看配置文件的注释说明
3. 检查环境变量是否正确设置
4. 查看服务器日志获取详细错误信息
