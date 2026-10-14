import type {
  AIVideoProvider,
  VideoGenerationParams,
  VideoTaskResponse,
} from "../types";

/**
 * ComfyUI Provider — 接自建 GPU（RunPod Serverless 或自托管 ComfyUI）
 *
 * 环境变量：
 * - COMFYUI_API_KEY      RunPod API Key（或自托管时随便填一个，接口不校验）
 * - COMFYUI_API_URL      runpod 模式: https://api.runpod.ai/v2/<endpoint_id>
 *                        selfhosted 模式: http://<host>:8188
 * - COMFYUI_MODE         "runpod"（默认）| "selfhosted"
 * - COMFYUI_MEDIA_BASE   selfhosted 模式必填，如 https://gpu.example.com/view?filename=
 *
 * 模板工作流：ComfyUI 导出的 API 格式 JSON，支持占位符（对标目标站 prompt_api_template 设计）：
 *   <%seed%> <%prompt%> <%negative_prompt%> <%image_url%> <%width%> <%height%>
 * 提交时由 generate 路由从 templates 表读出 workflowJson，经 params.workflowJson 传入。
 *
 * RunPod worker 侧约定 output：{ videoUrl: string }
 */
export class ComfyUIProvider implements AIVideoProvider {
  name = "comfyui";
  supportImageToVideo = true;

  private apiKey: string;
  private mode: "runpod" | "selfhosted";
  private baseUrl: string;
  private mediaBase?: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.mode = (process.env.COMFYUI_MODE as "runpod" | "selfhosted") || "runpod";
    this.baseUrl = (process.env.COMFYUI_API_URL || "").replace(/\/+$/, "");
    this.mediaBase = process.env.COMFYUI_MEDIA_BASE;
    if (!this.baseUrl) {
      throw new Error("Missing COMFYUI_API_URL for comfyui provider");
    }
  }

  /** 常用宽高比 → 分辨率映射（按工作流实际支持调整） */
  private static DIMENSIONS: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "1:1": { width: 960, height: 960 },
    "4:3": { width: 1024, height: 768 },
    "3:4": { width: 768, height: 1024 },
  };

  /**
   * 把工作流 JSON 里的 <%占位符%> 替换为本次任务的实参。
   * 用 stringify→regex\u2192parse 实现，避免递归遍历。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fillPlaceholders(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workflow: Record<string, any>,
    params: VideoGenerationParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    const seed = Math.floor(Math.random() * 2 ** 31);
    const dims =
      ComfyUIProvider.DIMENSIONS[params.aspectRatio || "16:9"] ||
      ComfyUIProvider.DIMENSIONS["16:9"];

    const vars: Record<string, string> = {
      seed: String(seed),
      prompt: (params.prompt || "").replace(/"/g, '\\"'),
      negative_prompt: "",
      image_url: params.imageUrl || "",
      width: String(dims.width),
      height: String(dims.height),
    };

    const json = JSON.stringify(workflow).replace(
      /<%([a-z_]+)%>/g,
      (match, key: string) => (key in vars ? vars[key] : match)
    );
    return JSON.parse(json);
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workflow = (params as any).workflowJson as
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | Record<string, any>
      | undefined;
    if (!workflow) {
      throw new Error(
        "comfyui provider requires params.workflowJson (load template from templates table)"
      );
    }

    const filled = this.fillPlaceholders(workflow, params);

    if (this.mode === "runpod") {
      const response = await fetch(`${this.baseUrl}/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            workflow: filled,
            // 已签名的回调地址由 videoService 生成，worker 完成后回打
            callbackUrl: params.callbackUrl,
          },
        }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        taskId: result.id,
        provider: "comfyui",
        status: "pending",
        raw: result,
      };
    }

    // 自托管 ComfyUI 原生 /prompt 接口
    const response = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: filled,
        client_id: `videofly-${Date.now()}`,
      }),
    });
    const result = await response.json();
    if (result.error) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result.error as any)?.message || "ComfyUI prompt error"
      );
    }
    return {
      taskId: result.prompt_id,
      provider: "comfyui",
      status: "pending",
      raw: result,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    if (this.mode === "runpod") {
      const response = await fetch(`${this.baseUrl}/status/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const result = await response.json();
      return {
        taskId,
        provider: "comfyui",
        status: this.mapRunpodStatus(result.status),
        videoUrl: result.output?.videoUrl || result.output?.url,
        error:
          result.status === "FAILED" || result.status === "CANCELLED"
            ? {
                code: result.status,
                message: result.error || "Generation failed",
              }
            : undefined,
        raw: result,
      };
    }

    // 自托管：查 /history/{prompt_id}，从输出节点里找视频文件
    const response = await fetch(`${this.baseUrl}/history/${taskId}`);
    const history = await response.json();
    const entry = history[taskId];
    if (!entry) {
      return { taskId, provider: "comfyui", status: "processing" };
    }
    if (entry.status?.status_str === "error") {
      return {
        taskId,
        provider: "comfyui",
        status: "failed",
        error: {
          code: "COMFYUI_ERROR",
          message: entry.status.messages?.map((m: unknown[]) => String(m)).join("; "),
        },
      };
    }

    // 遍历输出节点找 videos/gifs/images 字段
    let videoUrl: string | undefined;
    for (const output of Object.values(entry.outputs || {})) {
      const files = (output as Record<string, unknown>).videos ||
        (output as Record<string, unknown>).gifs ||
        (output as Record<string, unknown>).images;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const first = (files as any[] | undefined)?.[0];
      if (first?.filename) {
        const q = `filename=${encodeURIComponent(first.filename)}&subfolder=${encodeURIComponent(
          first.subfolder || ""
        )}&type=${encodeURIComponent(first.type || "output")}`;
        videoUrl = `${this.baseUrl}/view?${q}`;
        break;
      }
    }

    return {
      taskId,
      provider: "comfyui",
      status: videoUrl ? "completed" : "processing",
      videoUrl,
      raw: entry,
    };
  }

  private mapRunpodStatus(
    status: string
  ): "pending" | "processing" | "completed" | "failed" {
    switch (status) {
      case "IN_QUEUE":
        return "pending";
      case "IN_PROGRESS":
        return "processing";
      case "COMPLETED":
        return "completed";
      default:
        return "failed";
    }
  }

  /**
   * RunPod webhook 载荷：{ id, status, output }
   * （generate 时把已签名的 /api/v1/video/callback/comfyui?videoUuid=..&ts=..&sig=..
   *  下发给 worker，worker 完成后原样回打，签名校验由路由层完成）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCallback(payload: any): VideoTaskResponse {
    return {
      taskId: payload.id || payload.taskId,
      provider: "comfyui",
      status: this.mapRunpodStatus(payload.status || "COMPLETED"),
      videoUrl: payload.output?.videoUrl || payload.output?.url,
      error: payload.error
        ? { code: "RUNPOD_ERROR", message: String(payload.error) }
        : undefined,
      raw: payload,
    };
  }
}
