import { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, templates } from "@/db";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/error";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const templatePatchSchema = z.object({
  templateKey: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  coverUrl: z.string().optional().nullable(),
  previewVideoUrl: z.string().optional().nullable(),
  category: z.string().optional(),
  engine: z.string().optional(),
  /** ComfyUI API 格式 JSON：对象或 JSON 字符串均可，缺省表示不更新 */
  workflowJson: z.unknown().optional(),
  /** 模板内置提示词（极简模式），null 清空 */
  defaultPrompt: z.string().max(5000).optional().nullable(),
  creditsCost: z.number().int().positive().optional(),
  maxDuration: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(),
  supportImageToVideo: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

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

/** 单个模板详情（含 workflowJson，供编辑表单回填） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin(request);
    const { key } = await params;
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.templateKey, key))
      .limit(1);
    if (!template) {
      throw new ApiError(`模板不存在: ${key}`, 404, { code: "TEMPLATE_NOT_FOUND" });
    }
    return apiSuccess({ template });
  } catch (error) {
    return handleApiError(error);
  }
}

/** 部分更新模板 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin(request);
    const { key } = await params;
    const body = await request.json();
    const data = templatePatchSchema.parse(body);

    const [existing] = await db
      .select()
      .from(templates)
      .where(eq(templates.templateKey, key))
      .limit(1);
    if (!existing) {
      throw new ApiError(`模板不存在: ${key}`, 404, { code: "TEMPLATE_NOT_FOUND" });
    }

    // 重命名时查重
    if (data.templateKey && data.templateKey !== key) {
      const [dup] = await db
        .select({ id: templates.id })
        .from(templates)
        .where(and(eq(templates.templateKey, data.templateKey), ne(templates.id, existing.id)))
        .limit(1);
      if (dup) {
        throw new ApiError(`模板 key 已存在: ${data.templateKey}`, 409, {
          code: "DUPLICATE_TEMPLATE_KEY",
        });
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.templateKey !== undefined) updates.templateKey = data.templateKey;
    if (data.name !== undefined) updates.name = data.name;
    if (data.coverUrl !== undefined) updates.coverUrl = data.coverUrl || null;
    if (data.previewVideoUrl !== undefined) updates.previewVideoUrl = data.previewVideoUrl || null;
    if (data.category !== undefined) updates.category = data.category;
    if (data.engine !== undefined) updates.engine = data.engine;
    if (data.workflowJson !== undefined) updates.workflowJson = normalizeWorkflowJson(data.workflowJson);
    if (data.defaultPrompt !== undefined) updates.defaultPrompt = data.defaultPrompt || null;
    if (data.creditsCost !== undefined) updates.creditsCost = data.creditsCost;
    if (data.maxDuration !== undefined) updates.maxDuration = data.maxDuration;
    if (data.aspectRatio !== undefined) updates.aspectRatio = data.aspectRatio;
    if (data.supportImageToVideo !== undefined) updates.supportImageToVideo = data.supportImageToVideo;
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    const [updated] = await db
      .update(templates)
      .set(updates as never)
      .where(eq(templates.templateKey, key))
      .returning();

    return apiSuccess({ template: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

/** 删除模板 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin(request);
    const { key } = await params;
    const deleted = await db
      .delete(templates)
      .where(eq(templates.templateKey, key))
      .returning({ id: templates.id });
    if (deleted.length === 0) {
      throw new ApiError(`模板不存在: ${key}`, 404, { code: "TEMPLATE_NOT_FOUND" });
    }
    return apiSuccess({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
