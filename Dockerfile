# syntax=docker/dockerfile:1
# ---- 多阶段构建：deps -> builder/migrate -> runner(standalone) ----

FROM node:20-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && apk add --no-cache libc6-compat

# 1) 依赖层（.npmrc 使用 node-linker=hoisted，保证 next standalone 追踪正确）
FROM base AS deps
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2) 构建层（SKIP_ENV_VALIDATION 跳过 src/env.mjs 构建期校验，运行时再校验）
FROM base AS builder
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1 NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 3) 迁移层：一次性容器，跑 drizzle-kit push（compose 中挂 tools profile）
FROM base AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["pnpm", "db:push"]

# 4) 运行层：standalone 产物，非 root
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
