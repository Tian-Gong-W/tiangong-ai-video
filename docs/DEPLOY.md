# 部署指南（Docker + GitHub Actions 自动部署）

## 架构总览

- **app**：Next.js 15 `standalone` 产物，多阶段 Docker 构建，非 root 运行，容器内监听 3000
- **db**：PostgreSQL 16（alpine），数据落在 named volume `pgdata`，不对公网暴露端口
- **migrate**：一次性容器，执行 `pnpm db:push` 同步 Drizzle schema；挂 `tools` profile，`docker compose up -d` 不会启动它
- **CI**：push 到 `Top-Men` → GitHub Actions 经 SSH 登录服务器 → 拉代码 → 构建镜像 → 迁移 → 重启

ComfyUI GPU 侧（RunPod Serverless / 自托管）不在本 compose 内，见 `worker/README.md` 与 `docs/COMFYUI-INTEGRATION.md`。

## 一、服务器准备（一次性）

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. 拉取私库代码（Deploy Key）

```bash
mkdir -p /opt/tiangong
ssh-keygen -t ed25519 -f ~/.ssh/tiangong_deploy -N ""
cat ~/.ssh/tiangong_deploy.pub
# 把公钥加到 GitHub 仓库 Settings → Deploy keys（只读即可）
GIT_SSH_COMMAND="ssh -i ~/.ssh/tiangong_deploy" \
  git clone git@github.com:Tian-Gong-W/tiangong-ai-video.git /opt/tiangong/app
```

### 3. 配置 `.env`

```bash
cd /opt/tiangong/app
cp .env.example .env
```

逐项填写：

- `BETTER_AUTH_SECRET`：用 `openssl rand -base64 32` 生成
- `NEXT_PUBLIC_APP_URL`：正式域名（https），生成回调与外链都依赖它
- ComfyUI：`COMFYUI_MODE=runpod`、`COMFYUI_API_KEY`、`COMFYUI_API_URL=https://api.runpod.ai/v2/<endpoint_id>`、`COMFYUI_MEDIA_BASE`
- Creem/Stripe、R2/S3（视频存储）、邮件：按 `.env.example` 注释逐项填写
- `DATABASE_URL` 不用手填指向本机：compose 会自动注入 `postgres://…@db:5432/…`；要改账号密码，在 `.env` 中定义 `POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB` 即可

### 4. 首次构建启动

```bash
docker compose build app
docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose up -d app
curl -I http://127.0.0.1:3000   # 期望 200/30x
```

生产建议在 app 前面挂 Nginx/Caddy 反代 + 域名 + TLS（RunPod worker 回调要求公网 https 地址）。

## 二、配置自动部署（GitHub Actions）

仓库 Settings → Secrets and variables → Actions，添加 4 个 secret：

| Secret | 内容 |
| --- | --- |
| `SSH_HOST` | 服务器 IP 或域名 |
| `SSH_USER` | SSH 登录用户（需能执行 docker） |
| `SSH_PRIVATE_KEY` | 登录服务器所用私钥内容（对应公钥加入服务器 `~/.ssh/authorized_keys`） |
| `DEPLOY_PATH` | 服务器上仓库绝对路径（如 `/opt/tiangong/app`） |

之后每次 push 到 `Top-Men`（`docs/`、`worker/`、markdown 改动除外）自动执行部署，无需手动操作。

## 三、RunPod / ComfyUI 接线

1. 按 `worker/README.md` 构建镜像并创建 RunPod Serverless endpoint
2. endpoint id 填入 `.env` 的 `COMFYUI_API_URL`
3. `docker compose up -d app` 重启生效
4. 在后台管理（/admin/templates）录入 ComfyUI **API 格式**导出的工作流 JSON（含 `<%seed%>` 等占位符），前台模板目录即可选模板出片

## 四、日常运维

```bash
docker compose logs -f app                        # 应用日志
docker compose restart app                        # 重启应用
docker compose --profile tools run --rm migrate   # schema 变更后手动迁移
docker compose exec db psql -U tiangong           # 进数据库
docker compose exec db pg_dump -U tiangong tiangong > backup.sql  # 备份
```

## 五、常见问题

- **构建时报环境变量校验错误**：Dockerfile 已设 `SKIP_ENV_VALIDATION=1`；若仍报错，检查 `next.config.mjs` 是否被改动
- **migrate 连不上 db**：先 `docker compose up -d db` 并等 healthcheck 通过再迁移
- **生成视频回调失败**：确认 `NEXT_PUBLIC_APP_URL` 是公网 https 且 RunPod worker 能访问到它；回调签名机制见 `docs/COMFYUI-INTEGRATION.md`
- **改了 `POSTGRES_PASSWORD` 但连不上**：volume 里已有旧密码的初始化数据，需要删 volume 重建（会清库，注意备份）
