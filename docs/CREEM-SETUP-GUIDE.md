# Creem 支付接入完整指南

本文档详细说明如何接入 Creem 支付系统，包括创建产品、配置 Webhook 和测试支付流程。

## 目录

1. [前置准备](#前置准备)
2. [创建 Creem 产品](#创建-creem-产品)
3. [配置 Webhook](#配置-webhook)
4. [更新代码配置](#更新代码配置)
5. [测试支付流程](#测试支付流程)
6. [常见问题](#常见问题)

---

## 前置准备

### 1. 注册 Creem 账号

访问 [Creem Dashboard](https://dashboard.creem.io) 注册账号并完成认证。

### 2. 获取 API 密钥

1. 登录 Creem Dashboard
2. 进入 Settings → API Keys
3. 创建 Publishable Key 和 Secret Key
4. 添加到 `.env.local` 文件：

```bash
CREEM_API_KEY='creem_live_xxx'  # 或 creem_test_xxx (测试环境)
CREEM_WEBHOOK_SECRET='your-webhook-secret'
```

### 3. 确认环境变量

在 `.env.local` 中确认以下配置：

```bash
# 应用 URL（重要：Webhook 回调地址）
NEXT_PUBLIC_APP_URL='http://localhost:3000'  # 开发环境
# NEXT_PUBLIC_APP_URL='https://videofly.app'  # 生产环境

# 支付提供商
NEXT_PUBLIC_BILLING_PROVIDER='creem'
```

---

## 创建 Creem 产品

需要在 Creem 后台创建 **9 个产品**（3 个月付订阅、3 个年付订阅、3 个一次性积分包）。

### 产品清单

#### 1. 月付订阅（Monthly Subscriptions）

| 产品名称 | 价格 | 周期 | 积分 | Product ID |
|---------|------|------|------|------------|
| Basic Plan | $9.90 | 月付 | 280 | 需创建 |
| Pro Plan ⭐ | $29.90 | 月付 | 960 | 需创建 |
| Ultimate Plan | $79.90 | 月付 | 2,850 | 需创建 |

#### 2. 年付订阅（Yearly Subscriptions）

| 产品名称 | 价格 | 周期 | 积分 | Product ID |
|---------|------|------|------|------------|
| Basic Plan (Yearly) | $99.00 | 年付 | 3,360 | 需创建 |
| Pro Plan (Yearly) ⭐ | $299.00 | 年付 | 11,520 | 需创建 |
| Ultimate Plan (Yearly) | $799.00 | 年付 | 34,200 | 需创建 |

#### 3. 一次性积分包（One-time Credit Packages）

| 产品名称 | 价格 | 积分 | 购买限制 | Product ID |
|---------|------|------|---------|------------|
| Starter Pack | $14.90 | 280 | 所有用户 | 需创建 |
| Standard Pack ⭐ | $39.90 | 960 | 仅订阅用户 | 需创建 |
| Pro Pack | $99.90 | 2,850 | 仅订阅用户 | 需创建 |

### 创建步骤

#### 步骤 1：创建订阅产品（以 Basic Monthly 为例）

1. 登录 [Creem Dashboard](https://dashboard.creem.io)
2. 进入 **Products** → 点击 **Create Product**
3. 填写产品信息：

```yaml
产品类型: Subscription (订阅)
产品名称: Basic Plan
描述: 280 credits/month - Perfect for individuals

定价:
  - 货币: USD
  - 价格: 9.90
  - 计费周期: Monthly (月付)
  - Trial Period: 0 (无试用期)

元数据 (Metadata - 可选):
  - credits: "280"
  - features: "hd_videos,fast_generation"
```

4. 点击 **Create Product**
5. 复制生成的 **Product ID**（格式：`prod_xxx`）
6. 保存到 `pricing-user.ts` 的对应位置

#### 步骤 2：创建年付订阅

重复上述步骤，修改以下字段：

```yaml
产品名称: Basic Plan (Yearly)
价格: 99.00
计费周期: Yearly (年付)
元数据:
  - credits: "3360"
```

#### 步骤 3：创建一次性积分包

1. 产品类型选择 **One-time**（一次性）
2. 不设置计费周期
3. 示例配置：

```yaml
产品类型: One-time
产品名称: Starter Pack
描述: 280 credits - One-time purchase

定价:
  - 货币: USD
  - 价格: 14.90
  - 一次性购买

元数据:
  - credits: "280"
  - allow_free_user: "true"
```

### 完整创建清单

使用以下清单确保所有产品都已创建：

```markdown
## 月付订阅
- [ ] Basic Plan ($9.90/mo, 280 credits) → Product ID: _________
- [ ] Pro Plan ($29.90/mo, 960 credits) → Product ID: _________
- [ ] Ultimate Plan ($79.90/mo, 2,850 credits) → Product ID: _________

## 年付订阅
- [ ] Basic Plan Yearly ($99/yr, 3,360 credits) → Product ID: _________
- [ ] Pro Plan Yearly ($299/yr, 11,520 credits) → Product ID: _________
- [ ] Ultimate Plan Yearly ($799/yr, 34,200 credits) → Product ID: _________

## 积分包
- [ ] Starter Pack ($14.90, 280 credits) → Product ID: _________
- [ ] Standard Pack ($39.90, 960 credits) → Product ID: _________
- [ ] Pro Pack ($99.90, 2,850 credits) → Product ID: _________
```

---

## 配置 Webhook

Webhook 用于接收 Creem 的支付状态通知，自动为用户充值积分。

### 步骤 1：获取 Webhook URL

根据你的环境：

```bash
# 开发环境
https://localhost:3000/api/auth/creem/webhook

# 生产环境
https://videofly.app/api/auth/creem/webhook
```

### 步骤 2：在 Creem 配置 Webhook

1. 进入 Creem Dashboard → **Webhooks**
2. 点击 **Add Webhook**
3. 填写配置：

```yaml
Endpoint URL: https://videofly.app/api/auth/creem/webhook
Events (选择以下事件):
  - checkout.completed ✅ (支付完成)
  - subscription.created ✅ (订阅创建)
  - subscription.updated ✅ (订阅更新)
  - subscription.cancelled ✅ (订阅取消)
  - subscription.expired ✅ (订阅过期)
Secret: (自动生成，复制到 .env.local)
```

4. 点击 **Save**
5. **重要**：复制生成的 **Webhook Secret** 到 `.env.local`：

```bash
CREEM_WEBHOOK_SECRET='whsec_xxx'  # 或 webhook_xxx
```

### 步骤 3：验证 Webhook（可选）

Creem 会发送测试 webhook，确保你的服务器能正确接收：

```bash
# 查看本地开发服务器日志
pnpm dev

# 或者使用 ngrok 暴露本地端口进行测试
ngrok http 3000
```

---

## 更新代码配置

### 步骤 1：更新 Product ID

打开 `src/config/pricing-user.ts`，将所有 `prod_xxx` 替换为从 Creem 后台复制的 Product ID：

```typescript
export const SUBSCRIPTION_PRODUCTS = [
  // 月付订阅
  {
    id: "prod_jsRIeZmqn3L9NN0fiFIn6", // ✅ 已填写 Basic Monthly
    name: "Basic Plan",
    priceUsd: 9.9,
    credits: 280,
    period: "month" as const,
    popular: false,
    enabled: true,
  },
  {
    id: "prod_YOUR_PRO_MONTHLY_ID", // ⚠️ 替换为实际 ID
    name: "Pro Plan",
    priceUsd: 29.9,
    credits: 960,
    period: "month" as const,
    popular: true,
    enabled: true,
  },
  // ... 其他产品
];
```

### 步骤 2：验证配置

运行以下命令检查配置是否正确：

```bash
# 启动开发服务器
pnpm dev

# 访问定价页面
open http://localhost:3000/pricing
```

检查点：
- [ ] 所有 9 个产品都显示在页面上
- [ ] 价格显示正确（$9.90, $29.90 等）
- [ ] 积分数量显示正确
- [ ] 推荐标签显示在正确的产品上

---

## 测试支付流程

### 1. 测试环境配置

Creem 提供测试密钥，用于模拟支付：

```bash
# .env.local
CREEM_API_KEY='creem_test_xxx'  # 测试密钥
CREEM_WEBHOOK_SECRET='whsec_test_xxx'
```

### 2. 测试一次性购买

```bash
# 1. 访问定价页面
open http://localhost:3000/pricing

# 2. 点击 "一次性积分包" 标签
# 3. 点击 "Starter Pack" 的购买按钮
# 4. 使用 Creem 测试卡号完成支付
# 5. 支付成功后跳转回 /my-creations?payment=success
# 6. 检查用户积分是否增加
```

测试卡号（Creem 测试环境）：
```
卡号: 4242 4242 4242 4242
过期: 任意未来日期 (如 12/34)
CVC: 任意3位数字 (如 123)
```

### 3. 测试订阅购买

```bash
# 1. 切换到 "按月订阅" 标签
# 2. 点击 "Pro Plan" 的订阅按钮
# 3. 完成支付
# 4. 检查：
#    - 用户订阅状态
#    - 积分是否到账
#    - 订阅管理按钮是否显示
```

### 4. 测试 Webhook

使用 Creem Dashboard 的 Webhook 测试功能：

1. 进入 Webhooks → 选择你的 webhook
2. 点击 **Send test webhook**
3. 选择事件类型：`checkout.completed`
4. 检查你的服务器日志，确认收到请求

### 5. 验证积分系统

```bash
# 使用开发者工具检查积分
pnpm script:check-credits user@example.com
```

---

## 常见问题

### Q1: Product ID 找不到？

**原因**：产品未创建或 ID 复制错误

**解决**：
1. 登录 Creem Dashboard
2. 进入 Products → 找到对应产品
3. 复制 Product ID（格式：`prod_xxx`）
4. 确保粘贴到 `pricing-user.ts` 时没有多余空格

### Q2: Webhook 不工作？

**原因**：URL 错误或 Secret 不匹配

**检查清单**：
- [ ] `NEXT_PUBLIC_APP_URL` 是否正确（不要有尾部斜杠）
- [ ] Webhook URL 是否为：`https://yourdomain.com/api/auth/creem/webhook`
- [ ] Webhook Secret 是否正确复制到 `.env.local`
- [ ] 服务器是否可从外网访问（开发环境使用 ngrok）

### Q3: 支付成功但积分没到账？

**原因**：Webhook 未正确处理

**调试步骤**：
```bash
# 1. 查看服务器日志
tail -f logs/server.log | grep creem

# 2. 检查数据库 credit_transactions 表
SELECT * FROM credit_transactions
WHERE user_id = 'your_user_id'
ORDER BY created_at DESC
LIMIT 10;

# 3. 检查 creem_subscriptions 表
SELECT * FROM creem_subscriptions
WHERE user_id = 'your_user_id';
```

### Q4: 如何禁用某个产品？

在 `pricing-user.ts` 中将 `enabled` 设为 `false`：

```typescript
{
  id: "prod_xxx",
  name: "Basic Plan",
  enabled: false, // ⬅️ 设为 false 禁用
  // ...
}
```

### Q5: 如何修改价格？

**重要**：不要直接修改现有产品！正确流程：

1. 在 Creem 后台创建新产品（v2）
2. 更新 `pricing-user.ts` 中的 Product ID
3. 新用户使用新产品
4. 老用户继续使用旧产品，直到订阅结束

---

## 生产环境检查清单

部署到生产环境前，确保完成以下检查：

### 环境变量
- [ ] `NEXT_PUBLIC_APP_URL` 改为生产域名
- [ ] `CREEM_API_KEY` 使用生产密钥（`creem_live_xxx`）
- [ ] `CREEM_WEBHOOK_SECRET` 使用生产 Secret

### 产品配置
- [ ] 所有 9 个产品的 Product ID 已填写
- [ ] 产品价格与 `pricing-user.ts` 一致
- [ ] 积分数量配置正确

### Webhook
- [ ] Webhook URL 使用生产域名
- [ ] Webhook Secret 已更新
- [ ] 测试 Webhook 发送成功

### 功能测试
- [ ] 一次性积分包购买成功
- [ ] 月付订阅购买成功
- [ ] 年付订阅购买成功
- [ ] 支付成功后积分到账
- [ ] 订阅管理页面可用

### 安全检查
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 不在代码中硬编码 API 密钥
- [ ] Webhook 验证 Secret 已配置

---

## 下一步

支付接入完成后，你可能还需要：

- **自定义价格页面**：修改 `/pricing` 页面的样式和文案
- **邮件通知**：配置购买成功后的邮件提醒（使用 Resend）
- **数据分析**：集成 PostHog 或 Google Analytics 追踪支付转化
- **优惠码**：在 Creem 后台创建优惠券代码

---

## 相关文档

- **[价格配置文档](/docs/config/price)** - 如何在 `pricing-user.ts` 中配置价格
- **[定价策略文档](/docs/pricing)** - 定价逻辑和成本分析
- **[环境配置文档](/docs/env)** - 环境变量配置说明
- **[积分系统文档](/docs/credits)** - 积分消耗和过期规则
- **[Creem 官方文档](https://docs.creem.io)** - Creem API 和 SDK 文档

---

*最后更新: 2026-02-02*
*适用版本: VideoFly v1.0+*
