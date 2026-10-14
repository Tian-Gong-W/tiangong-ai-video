---
name: pricing-setup
description: >
  VideoFly 商品定价与积分配置向导。引导用户完成订阅产品定价、积分包配置、新用户赠送积分设置，
  自动更新 pricing-user.ts 代码和 price-data.ts / price-faq-data.ts 展示数据，
  最终生成 Creem 后台操作指南 markdown 文档，帮助用户在 Creem 创建商品并回填 Product ID。
  触发词："配置定价"、"设置价格"、"pricing setup"、"配置积分"、"设置积分包"、
  "配置商品"、"setup pricing"、"configure credits"、"定价配置"、"积分配置"、
  "creem 商品"、"创建商品"、"product setup"。
---

# VideoFly 商品定价与积分配置向导

通过多轮对话引导用户完成 VideoFly 的完整定价体系配置。

## 成本模型

积分成本参考 evolink.ai 的 API 定价，按 1:1 设置积分消耗。

- **1 积分 = 0.1 元人民币**（约 $0.014 USD，按汇率 7.2 计算）
- 成本计算：套餐积分 x $0.014 = 积分成本(USD)
- 毛利率 = (售价 - 积分成本) / 售价 x 100%

在 Step 2 和 Step 3 的确认环节，展示利润率分析表：

```
| 方案 | 售价 | 积分 | 积分成本 | 毛利 | 毛利率 |
|------|------|------|----------|------|--------|
| Basic 月付 | $9.90 | 280 | $3.89 | $6.01 | 60.7% |
| Pro 月付 | $29.90 | 960 | $13.33 | $16.57 | 55.4% |
| Ultimate 月付 | $79.90 | 2,850 | $39.58 | $40.32 | 50.5% |
| Basic 年付 | $95.00 | 3,360 | $46.67 | $48.33 | 50.9% |
| Pro 年付 | $287.00 | 11,520 | $160.00 | $127.00 | 44.3% |
| Ultimate 年付 | $767.00 | 34,200 | $475.00 | $292.00 | 38.1% |
```

计算公式（汇率可调，默认 7.2）：
- 积分成本(USD) = 积分数 x 0.1 / 汇率
- 毛利(USD) = 售价 - 积分成本
- 毛利率 = 毛利 / 售价 x 100%

## 核心文件

| 文件 | 用途 |
|------|------|
| `src/config/pricing-user.ts` | 主配置文件：所有价格、积分、模型计费 |
| `src/config/price/price-data.ts` | 前端展示数据（自动从 pricing-user.ts 生成） |
| `src/config/price/price-faq-data.ts` | 定价页 FAQ（需手动同步价格数字） |
| `src/config/credits.ts` | 内部积分系统（从 pricing-user.ts 读取，无需修改） |
| `.env.local` | Creem API 密钥和 Webhook Secret |
| `docs/CREEM-SETUP-GUIDE.md` | Creem 后台操作参考文档 |

## 工作流程

按以下 5 步顺序执行。每步收集用户输入后再进入下一步。

### Step 1: 基础设置 - 新用户注册赠送

读取 `src/config/pricing-user.ts` 中的 `NEW_USER_GIFT`，向用户展示当前配置并询问：

1. **是否赠送新用户积分？** 当前: `enabled: true/false`
2. **赠送多少积分？** 当前: `credits: N`（提示：1 个 Veo 3.1 视频 = 10 积分，1 个 Sora 2 视频 = 2 积分）
3. **赠送积分有效期？** 当前: `validDays: N` 天

`CREDIT_EXPIRATION`（赠送积分有效期、订阅积分有效期、一次性购买积分有效期）保持默认值不变，
除非用户主动要求修改。不要主动询问这些过期时间配置。

用户确认后，更新 `NEW_USER_GIFT` 对象。

### Step 2: 订阅产品定价

读取 `SUBSCRIPTION_PRODUCTS` 数组，向用户展示当前订阅方案。

#### 2a. 收集月付方案

询问用户：

1. **需要几个订阅档位？** 默认 3 档（Basic / Pro / Ultimate）
2. **每档的月付价格和积分？** 提供当前值作为参考
3. **哪个档位标记为推荐（popular）？** 默认中间档位（Pro）
4. **是否禁用某个档位？**

#### 2b. 年付折扣自动计算

询问用户年付折扣率，默认 **20%**（即年付 = 月付 x 12 x 0.8）。用户可自定义折扣率。

年付自动计算规则：
- **年付价格** = 月付价格 x 12 x (1 - 折扣率)，取整数
- **年付积分** = 月付积分 x 12（用户享受全年完整积分，不打折）
- 中间档位（推荐档）的折扣力度最合适，是主推方案

#### 2c. 展示完整方案让用户确认

展示两张表。第一张：月付 + 年付的完整对比：

```
| 方案 | 月付 | 月积分 | 年付 | 年积分 | 年付折扣 | 年省 | 推荐 |
|------|------|--------|------|--------|----------|------|------|
| Basic | $9.90 | 280 | $95 | 3,360 | 20% | $23.80 | |
| Pro | $29.90 | 960 | $287 | 11,520 | 20% | $71.80 | * |
| Ultimate | $79.90 | 2,850 | $767 | 34,200 | 20% | $190.80 | |
```

第二张：利润率分析（基于成本模型自动计算）：

```
| 方案 | 售价 | 积分 | 积分成本 | 毛利 | 毛利率 |
|------|------|------|----------|------|--------|
| Basic 月付 | $9.90 | 280 | $3.89 | $6.01 | 60.7% |
| Pro 月付 | $29.90 | 960 | $13.33 | $16.57 | 55.4% |
| ... | ... | ... | ... | ... | ... |
```

提示用户：月付毛利率建议 50-65%，年付因折扣毛利率会低 10-15 个百分点。
如果某方案毛利率低于 35%，给出警告。

**必须等用户明确确认后**，才进入下一步。

用户确认后，更新 `SUBSCRIPTION_PRODUCTS` 数组。注意：
- `id` 字段暂时保留占位符格式 `prod_PLAN_PERIOD`（后续从 Creem 回填）
- `name` 字段格式：月付 `"Basic Plan"`，年付 `"Basic Plan (Yearly)"`
- `period` 字段：月付 `"month"`，年付 `"year"`

### Step 3: 积分包配置

读取 `CREDIT_PACKAGES` 数组，向用户展示当前积分包。

询问用户：

1. **是否需要积分包？** 如不需要，将所有积分包 `enabled: false`，跳到 Step 4
2. **需要几个积分包？** 默认 3 个
3. **每个积分包的价格和积分？** 提示：积分包通常比订阅月付贵 25-35%
4. **哪些积分包允许免费用户购买？** `allowFreeUser: true/false`
5. **哪个标记为推荐？**

展示积分包方案 + 利润率分析（同 Step 2 格式），让用户确认后更新 `CREDIT_PACKAGES` 数组。
积分包毛利率通常比订阅高（因为溢价 25-35%），建议 60-75%。`id` 同样暂用占位符。

### Step 4: 同步前端展示（关键步骤）

用户确认定价方案后，**必须同步所有前端展示文件**，确保网站展示与配置一致。

#### 4a. price-data.ts - 前端展示文案

`price-data.ts` 的价格数据从 `SUBSCRIPTION_PRODUCTS` 自动生成，但 `planFeatures` 中的文案需手动同步：

- 更新每个档位 benefits 中的积分数字描述
  - 格式：`"每月 {N} 积分（约 {N/10} 个视频）"` / `"{N} credits/month (~{N/10} videos)"`
  - 约数按 Veo 3.1 = 10 积分/视频计算
- 如果方案名称或档位数量变化，同步更新 `planIdMap` 和 `plans` 数组
- 更新 description 描述文案

#### 4b. price-faq-data.ts - 定价页 FAQ

**逐条检查并更新** FAQ 中所有涉及价格和积分的数字（zh / en / ja / ko 四种语言）：

需要同步的数据点：
- 各档位月付价格（$X.XX/月）
- 各档位年付价格（$XXX/年）
- 各档位月积分和年积分数量
- 积分包价格和积分数量
- 折扣比例（如 "省 20%"）
- "约 N 个视频" 的估算数

只更新数字和与定价直接相关的文案，不改变 FAQ 结构和问题本身。

#### 4c. pricing 组件页面

搜索以下文件中是否有硬编码的价格数字需要同步：
- `src/messages/en.json` 和 `src/messages/zh.json` 中的 pricing 相关 key
- `src/components/` 下与 pricing 相关的组件
- `src/app/[locale]/(marketing)/pricing/` 下的页面文件

使用 Grep 搜索旧价格数字（如 `9.90`、`29.90`、`280`、`960` 等），确保无遗漏。

#### 4d. 变更校验

完成所有文件修改后，输出变更汇总表：

```
| 文件 | 修改内容 |
|------|----------|
| pricing-user.ts | 更新了 N 个产品配置 |
| price-data.ts | 同步了积分描述文案 |
| price-faq-data.ts | 更新了 N 条 FAQ 中的数字 |
| ... | ... |
```

### Step 5: 生成 Creem 操作指南

根据最终配置，生成 `docs/CREEM-PRODUCT-CHECKLIST.md` 文档，包含：

#### 5a. 产品创建清单

按产品逐一列出在 Creem 后台创建时需要填写的信息：

```markdown
## 需要在 Creem 创建的产品

### 月付订阅

#### 1. Basic Plan (Monthly)
- 产品类型: Subscription
- 产品名称: Basic Plan
- 描述: {credits} credits/month - Perfect for individuals
- 价格: ${price} USD
- 计费周期: Monthly
- 元数据: credits="{credits}", features="{features}"
- [ ] 已创建  Product ID: _______________

（每个产品重复此格式）
```

#### 5b. Product ID 回填指引

```markdown
## 回填 Product ID

创建完所有产品后，将 Product ID 填入 `src/config/pricing-user.ts`：

1. 打开 `src/config/pricing-user.ts`
2. 找到对应产品，将 `id` 字段替换为 Creem 的 Product ID

示例：
  id: "prod_4yNyvLWQ88n8AqJj35uOvK", // Basic Monthly
```

#### 5c. Webhook 配置提醒

```markdown
## Webhook 配置

1. Creem Dashboard -> Webhooks -> Add Webhook
2. URL: {NEXT_PUBLIC_APP_URL}/api/auth/creem/webhook
3. Events: checkout.completed, subscription.created/updated/cancelled/expired
4. 复制 Secret 到 .env.local 的 CREEM_WEBHOOK_SECRET
```

#### 5d. 验证清单

```markdown
## 验证清单
- [ ] 所有产品已在 Creem 创建
- [ ] Product ID 已回填到 pricing-user.ts
- [ ] CREEM_API_KEY 已配置
- [ ] CREEM_WEBHOOK_SECRET 已配置
- [ ] pnpm dev 启动后 /pricing 页面显示正确
- [ ] 价格、积分、折扣数字在页面上展示正确
- [ ] FAQ 中的数字与实际配置一致
- [ ] 测试环境支付流程正常
```

## 交互要求

- 每步展示当前配置，让用户看到现状后再决定是否修改
- 用表格形式展示产品数据，便于对比
- **价格确认后再改代码**：修改代码前必须先让用户确认完整方案
- 价格用美元（如 9.9），不是美分
- 积分用整数
- Step 4 是关键步骤：**必须主动搜索并同步所有前端展示文件**，不能遗漏
- 完成所有步骤后，输出完整的变更摘要
