import type {
  AIVideoProvider,
  VideoGenerationParams,
  VideoTaskResponse,
} from "../types";
import {
  getProviderModelId,
  transformParamsForProvider,
} from "../model-mapping";

/**
 * APImart Provider
 *
 * API docs: https://docs.apimart.ai/en
 * Base URL: https://api.apimart.ai/v1
 *
 * Supported models:
 * - sora-2
 * - wan2.6
 * - veo3.1-fast / veo3.1-quality
 * - doubao-seedance-1-5-pro
 * - doubao-seedance-1-0-pro-fast / doubao-seedance-1-0-pro-quality
 *
 * Adding new models:
 * 1. Add model mapping in src/ai/model-mapping.ts (MODEL_MAPPINGS[modelId].providers.apimart)
 * 2. Add model config in src/config/credits.ts (baseConfigs)
 * 3. Add pricing in src/config/pricing-user.ts (VIDEO_MODEL_PRICING)
 */
export class ApimartProvider implements AIVideoProvider {
  name = "apimart";
  supportImageToVideo = true;
  private apiKey: string;
  private baseUrl = "https://api.apimart.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const internalModelId = params.model || "seedance-1.5-pro";
    const providerModelId = getProviderModelId(
      internalModelId,
      "apimart",
      params
    );
    const transformedParams = transformParamsForProvider(
      internalModelId,
      "apimart",
      params
    );

    const response = await fetch(`${this.baseUrl}/videos/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...transformedParams,
        model: providerModelId,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // APImart response: { code: 200, data: [{ status: "submitted", task_id: "task_xxx" }] }
    const taskData = Array.isArray(data.data) ? data.data[0] : data.data;
    const taskId = taskData?.task_id || taskData?.id || data.task_id || data.id;

    return {
      taskId,
      provider: "apimart",
      status: this.mapStatus(taskData?.status || data.status || "pending"),
      progress: data.progress,
      estimatedTime: data.estimated_time,
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404 || response.status === 410) {
        return {
          taskId,
          provider: "apimart",
          status: "failed",
          error: {
            code: "TASK_NOT_FOUND",
            message: errorText || "Task not found or expired",
          },
        };
      }
      if (response.status === 429) {
        throw new Error(
          `Rate limit exceeded. Please retry later. ${errorText}`
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Authentication failed. Check your API key. ${errorText}`
        );
      }
      throw new Error(
        `Failed to get task status (${response.status}): ${errorText}`
      );
    }

    const raw = await response.json();

    // APImart status response:
    // { code: 200, data: { id, status, progress, estimated_time, result: { videos: [{ url: [...] }] } } }
    const data = raw.data || raw;
    const rawUrl = data.result?.videos?.[0]?.url;
    const videoUrl = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;
    const thumbnailUrl = data.result?.thumbnail_url;

    return {
      taskId: data.id || taskId,
      provider: "apimart",
      status: this.mapStatus(data.status),
      progress: data.progress,
      estimatedTime: data.estimated_time,
      videoUrl: typeof videoUrl === "string" ? videoUrl : undefined,
      thumbnailUrl,
      error: data.error,
      raw,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCallback(payload: any): VideoTaskResponse {
    // APImart callback: may have { code, data: { ... } } or flat format
    const data = payload.data || payload;
    const rawUrl = data.result?.videos?.[0]?.url;
    const videoUrl = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;
    const thumbnailUrl = data.result?.thumbnail_url;

    return {
      taskId: data.id || data.task_id,
      provider: "apimart",
      status: this.mapStatus(data.status),
      progress: data.progress,
      videoUrl: typeof videoUrl === "string" ? videoUrl : undefined,
      thumbnailUrl,
      error: data.error,
      raw: payload,
    };
  }

  private mapStatus(status: string): VideoTaskResponse["status"] {
    const map: Record<string, VideoTaskResponse["status"]> = {
      submitted: "pending",
      pending: "pending",
      processing: "processing",
      completed: "completed",
      failed: "failed",
      cancelled: "failed",
    };
    return map[status] || "pending";
  }
}
