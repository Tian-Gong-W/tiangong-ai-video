import { NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, templates } from "@/db";
import { apiSuccess, handleApiError } from "@/lib/api/response";

/**
 * 公开模板目录（仅返回展示元数据，不下发 workflowJson）
 * GET /api/v1/templates          → 全部启用模板（按 sortOrder 排序）
 * GET /api/v1/templates?key=xxx   → 单个启用模板（不存在/停用返回空数组）
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    const baseSelect = db
      .select({
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
      })
      .from(templates);

    const rows = key
      ? await baseSelect
          .where(and(eq(templates.templateKey, key), eq(templates.isActive, true)))
          .limit(1)
      : await baseSelect
          .where(eq(templates.isActive, true))
          .orderBy(asc(templates.sortOrder));

    return apiSuccess({ templates: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
