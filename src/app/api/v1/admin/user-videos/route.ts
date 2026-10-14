import { NextRequest, NextResponse } from "next/server";
import { getUserVideos, getUserVideoStats } from "@/lib/admin/user-videos";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    // 并行获取视频列表和统计信息
    const [videosData, stats] = await Promise.all([
      getUserVideos({
        userId,
        page,
        limit: 10,
        status: status && status !== "all" ? (status as any) : undefined,
      }),
      getUserVideoStats(userId),
    ]);

    return NextResponse.json({
      videos: videosData.videos,
      totalVideos: videosData.totalVideos,
      totalPages: videosData.totalPages,
      stats,
    });
  } catch (error) {
    console.error("获取用户视频失败:", error);
    return NextResponse.json(
      { error: "获取用户视频失败" },
      { status: 500 }
    );
  }
}
