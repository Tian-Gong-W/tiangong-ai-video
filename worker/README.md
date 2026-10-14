# RunPod Serverless Worker（ComfyUI 后端）

自建 GPU 生成端：接收 Next.js 服务端下发的 ComfyUI API 工作流，
本 pod 内跑完、上传成片、回打签名回调。

## 数据流

~~~
Next.js generate 路由
  └─ templates 表读 workflowJson → 填充 <%seed%> <%prompt%> 等占位符
  └─ POST https://api.runpod.ai/v2/<endpoint>/run  { input: { workflow, callbackUrl } }
        └─ worker handler.py
              ├─ POST http://127.0.0.1:8188/prompt
              ├─ 轮询 /history/{prompt_id}
              ├─ GET  /view 下载成片
              ├─ 上传 S3/R2
              ├─ POST callbackUrl  { id, status: "COMPLETED", output: { videoUrl } }
              └─ return { videoUrl }   ← RunPod /status 兜底轮询用
  └─ 回调路由验签 → 下载成片转存站点 R2 → creditService.settle 结算积分
~~~

## 1. 构建并推送镜像

~~~bash
cd worker
docker build -t <你的镜像仓库>/tiangong-comfy-worker:latest .
docker push <你的镜像仓库>/tiangong-comfy-worker:latest
~~~

## 2. RunPod 控制台配置

1. **Serverless → New GPU Worker**：选镜像（上一步推送的），GPU 建议 RTX 4090 起（Wan 2.2 5B 用 24G 显存够跑 480p，高清建议 A100/H100）。
2. **挂载模型 Volume**（Network Storage）：ComfyUI 模型目录放 Wan 2.2 底模、VAE、NSFW LoRA（CivitAI 整包）。容器内路径与上游镜像一致（/ComfyUI/models）。
3. **环境变量（worker 侧）**：

| 变量 | 说明 |
| --- | --- |
| COMFY_HOST / COMFY_PORT | 默认 127.0.0.1 / 8188，一般不用改 |
| COMFY_POLL_TIMEOUT | 最长等待，默认 1800s |
| S3_ENDPOINT_URL | 如 https://<acct>.r2.cloudflarestorage.com |
| S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY | R2 token |
| S3_BUCKET_NAME | 成片 bucket |
| S3_PUBLIC_BASE | 公网访问前缀（自定义域/CDN） |

4. **Custom Nodes**：图生图/图生视频需要从 URL 读入图片的话，装 ComfyUI-LoadImage-From-URL 之类的节点（工作流里直接引用）。

## 3. Next.js 侧 .env

~~~
COMFYUI_MODE=runpod
COMFYUI_API_URL=https://api.runpod.ai/v2/<endpoint_id>
COMFYUI_API_KEY=<RunPod API Key>
~~~

## 4. 端到端验证

先插一条模板（workflow_json 换成你在 ComfyUI 里 **导出 API 格式** 的真实工作流，
提示词节点写 <%prompt%>、KSampler 的 seed 写 <%seed%>、尺寸写 <%width%>/<%height%>）：

~~~sql
INSERT INTO templates
  (template_key, name, category, workflow_json, engine, credits_cost,
   max_duration, aspect_ratio, support_image_to_video, sort_order, is_active)
VALUES (
  'comfy-wan22-nsfw',
  'Wan 2.2 基础模板',
  'nsfw-video',
  '{}'::jsonb,          -- ← 替换为真实导出的 API JSON
  'comfyui', 10, 5, '16:9', true, 0, true
);
~~~

调用生成接口（model 或 templateId 均可定位模板）：

~~~bash
curl -X POST https://<你的域名>/api/v1/video/generate \
  -H "Authorization: Bearer <用户 token>" \
  -H "Content-Type: application/json" \
  -d '{"model":"comfy-wan22-nsfw","templateId":"comfy-wan22-nsfw","prompt":"a cinematic shot of ..."}'
~~~

成功后 videos 表状态走 PENDING → GENERATING → UPLOADING → COMPLETED，
积分冻结→结算全程复用 creditService，无需额外代码。

## 契约速查

- worker 输入：`{ workflow, callbackUrl }`（RunPod 会包在 job.input 里）
- worker 返回：`{ videoUrl }`（RunPod /status 里即 output.videoUrl）
- 回调载荷：`{ id, status: "COMPLETED"|"FAILED", output: { videoUrl }, error? }`
- 站点侧验签：回调 URL 由 `generateSignedCallbackUrl` 生成，路由层校验签名

## 自托管模式（不经过 RunPod）

`COMFYUI_MODE=selfhosted` 时 provider 直接调 ComfyUI 原生 /prompt，
worker 不参与；成片经 `COMFYUI_MEDIA_BASE` 拼出公网 URL。
