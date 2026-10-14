# ComfyUI 自建引擎接入指南

本仓库在 videofly-template 基础上新增了第四个 AI Provider：`comfyui`，用于接入自建 GPU
（RunPod Serverless 或自托管 ComfyUI），跑自己的工作流模板（含社区 LoRA）。

## 1. 环境变量（.env.local）

```bash
COMFYUI_MODE=runpod            # runpod | selfhosted
COMFYUI_API_KEY=<RunPod API Key>
COMFYUI_API_URL=https://api.runpod.ai/v2/<endpoint_id>
COMFYUI_MEDIA_BASE=             # selfhosted 模式才需要
```

## 2. RunPod Serverless worker 契约

部署的 serverless handler（handler.py）收到：

```json
{ "input": { "workflow": "{...ComfyUI API JSON，占位符已替换...}", "callbackUrl": "..." } }
```

约定返回：`{ "videoUrl": "https://...mp4" }`（产物建议上传 R2/S3 后回传直链）。
完成后如带 callbackUrl，将
`{"id": "<request_id>", "status": "COMPLETED", "output": {"videoUrl": "..."}}`
POST 回 callbackUrl（videoService 已做 HMAC 签名校验）。

## 3. 模板系统

`templates` 表存 ComfyUI 导出的 **API 格式**工作流 JSON（不是普通导出，是 `(API 格式导出)`），
支持占位符（提交时替换）：

| 占位符 | 替换为 |
|---|---|
| `<%seed%>` | 随机种子 |
| `<%prompt%>` | 用户提示词 |
| `<%image_url%>` | 用户上传图 R2/S3 直链 |
| `<%width%>` / `<%height%>` | 按 aspectRatio 映射的分辨率 |

新增模板：`INSERT INTO templates (template_key, name, workflow_json, credits_cost, ...) VALUES (...)`

## 4. 改动清单（相对上游 videofly-template）

- `src/ai/types.ts` — ProviderType 增加 `comfyui`；params 增加 `templateId` / `workflowJson`
- `src/ai/provider-config.ts` — AI_PROVIDERS / COMFYUI_API_KEY 读取
- `src/ai/index.ts` — provider 工厂注册
- `src/ai/providers/comfyui.ts` — Provider 实现（runpod/selfhosted 双模式、状态查询、回调解析）
- `src/ai/model-mapping.ts` — `comfy-wan22-nsfw` 模型条目
- `src/db/schema.ts` — `templates` 表
- `src/app/api/v1/video/callback/[provider]/route.ts` — 回调白名单加 comfyui
- `.env.example` — COMFYUI_* 变量

## 5. 上游同步

底座来自 https://github.com/wjlbhlbh/videofly-template ，手动触发 `.github/workflows/import-base.yml`
可重新同步底座（会覆盖本仓库未列在改动清单中的文件，谨慎使用）。

## ⚠️ 内容合规

自建引擎绕过了商用聚合 API 的内容审查，运营方需自行承担目标市场的法律合规义务：
18+ 年龄验证、内容分级、存储加密、真实人物肖像权（faceswap 类）风险自评估。
