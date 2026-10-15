import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { z } from "zod";
// Import proxy configuration for fetch requests
import "@/lib/proxy-config";

const generateSchema = z.object({
  /** 极简模板模式（templateId 存在）允许空 prompt：提示词由模板 defaultPrompt 提供 */
  prompt: z.string().max(5000).default(""),
  model: z.string().min(1),
  duration: z.number().optional(),
  aspectRatio: z.string().optional(),
  quality: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  mode: z.string().optional(),
  outputNumber: z.number().int().min(1).optional().default(1),
  generateAudio: z.boolean().optional(),
  templateId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const data = generateSchema.parse(body);

    const result = await videoService.generate({
      userId: user.id,
      prompt: data.prompt,
      model: data.model,
      duration: data.duration,
      aspectRatio: data.aspectRatio,
      quality: data.quality,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls,
      mode: data.mode,
      outputNumber: data.outputNumber,
      generateAudio: data.generateAudio,
      templateId: data.templateId,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
