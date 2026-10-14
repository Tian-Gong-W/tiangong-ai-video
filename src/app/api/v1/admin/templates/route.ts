import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, templates } from "@/db";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/error";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const templateInputSchema = z.object({
  templateKey: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  coverUrl: z.string().optional().nullable(),
  previewVideoUrl: z.string().optional().nullable(),
  category: z.string().default("nsfw-video"),
  engine: z.string().default("comfyui"),
  /** ComfyUI API 格式 JSON：对象或 JSON 字符串均可 */
  workflowJson: z.unknown(),
  creditsCost: z.number().int().positive().default(10),
  maxDuration: z.number().int().positive().default(5),
  aspectRatio: z.string().default("16:9"),
  supportImageToVideo: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

/** workflowJson 归一化：字符串 → parse；必须是对象 */
function normalizeWorkflowJson(input: unknown): Record<string, unknown> {
  let parsed = input;
  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ApiError("workflowJson 必须是 ComfyUI API 格式的 JSON 对象", 400, {
      code: "INVALID_WORKFLOW",
    });
  }
  return parsed as Record<string, unknown>;
}

/** 管理端模板列表（全部，不含 workflowJson，编辑时经 /templates/[key] 取） */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const rows = await db
      .select({
        id: templates.id,
        templateKey: templates.templateKey,
        name: templates.name,
        coverUrl: templates.coverUrl,
        previewVideoUrl: templates.previewVideoUrl,
        category: templates.category,
        engine: templates.engine,
        creditsCost: templates.creditsCost,
        maxDuration: templates.maxDuration,
        aspectRatio: templates.aspectRatio,
        supportImageToVideo: templates.supportImageToVideo,
        sortOrder: templates.sortOrder,
        isActive: templates.isActive,
        createdAt: templates.createdAt,
      })
      .from(templates)
      .orderBy(asc(templates.sortOrder));
    return apiSuccess({ templates: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

/** 新建模板 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const data = templateInputSchema.parse(body);

    if (data.workflowJson === undefined) {
      throw new ApiError("缺少 workflowJson", 400, { code: "MISSING_WORKFLOW" });
    }
    const workflowJson = normalizeWorkflowJson(data.workflowJson);

    const [existing] = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.templateKey, data.templateKey))
      .limit(1);
    if (existing) {
      throw new ApiError(`模板 key 已存在: ${data.templateKey}`, 409, {
        code: "DUPLICATE_TEMPLATE_KEY",
      });
    }

    const [created] = await db
      .insert(templates)
      .values({
        templateKey: data.templateKey,
        name: data.name,
        coverUrl: data.coverUrl || null,
        previewVideoUrl: data.previewVideoUrl || null,
        category: data.category,
        engine: data.engine,
        workflowJson,
        creditsCost: data.creditsCost,
        maxDuration: data.maxDuration,
        aspectRatio: data.aspectRatio,
        supportImageToVideo: data.supportImageToVideo,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .returning();

    return apiSuccess({ template: created });
  } catch (error) {
    return handleApiError(error);
  }
}
