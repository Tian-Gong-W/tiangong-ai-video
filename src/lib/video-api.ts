import type { SubmitData } from "@/components/video-generator";

/**
 * API request format
 */
export interface VideoGenerateRequest {
  prompt: string;
  model: string;
  duration: number;
  aspectRatio?: string;
  quality?: string;
  imageUrl?: string;
  imageUrls?: string[];
  generateAudio?: boolean;
}

/**
 * Parse duration string to number
 * "10s" -> 10, "5s" -> 5, etc.
 * Clamps to valid range 4-30
 */
export function parseDuration(duration?: string): number {
  if (!duration) return 10;
  const num = Number.parseInt(duration.replace(/\D/g, ""));
  if (num < 4) return 4;
  if (num > 30) return 30;
  return num;
}

/**
 * Convert resolution to quality
 * "1080P" / "1080p" -> "1080p"
 * "720P" / "720p" -> "720p"
 * "480P" / "480p" -> "480p"
 */
export function resolutionToQuality(resolution?: string): string {
  if (!resolution) return "720p";
  if (resolution.toLowerCase().includes("1080")) return "1080p";
  if (resolution.toLowerCase().includes("480")) return "480p";
  return "720p";
}

/**
 * Upload image and return public URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch("/api/v1/upload", {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    throw new Error(uploadData.error?.message || "Failed to upload image");
  }

  return uploadData.data.publicUrl as string;
}

/**
 * Transform SubmitData to API request
 * Handles both `quality` (direct) and `resolution` (converted) fields
 */
export async function transformSubmitData(
  data: SubmitData
): Promise<VideoGenerateRequest> {
  // Upload images if exist (parallel upload for multiple images)
  let imageUrl: string | undefined;
  let imageUrls: string[] | undefined;
  if (data.images && data.images.length > 0) {
    const urls = await Promise.all(data.images.map(uploadImage));
    if (urls.length === 1) {
      imageUrl = urls[0];
    } else {
      imageUrls = urls;
    }
  }

  // Determine quality: use direct quality field if present, otherwise convert from resolution
  let quality: string | undefined;
  if (data.quality) {
    quality = data.quality;
  } else if (data.resolution) {
    quality = resolutionToQuality(data.resolution);
  }

  const model = data.model || "sora-2";

  return {
    prompt: data.prompt,
    model,
    duration: parseDuration(data.duration),
    aspectRatio: data.aspectRatio || undefined,
    quality,
    imageUrl,
    imageUrls,
    generateAudio: data.generateAudio,
  };
}

/**
 * Call video generation API
 */
export async function generateVideo(
  request: VideoGenerateRequest
): Promise<{ videoUuid: string; status: string; creditsUsed: number }> {
  const res = await fetch("/api/v1/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to generate video");
  }

  return data.data;
}

/**
 * Get video status (triggers backend refresh)
 */
export async function getVideoStatus(
  videoUuid: string
): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const res = await fetch(`/api/v1/video/${videoUuid}/status`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get video status");
  }

  return data.data;
}

/**
 * Get credit balance
 */
export async function getCreditBalance(): Promise<{
  totalCredits: number;
  usedCredits: number;
  frozenCredits: number;
  availableCredits: number;
  expiringSoon: number;
}> {
  const res = await fetch("/api/v1/credit/balance");
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get credit balance");
  }

  return data.data;
}
