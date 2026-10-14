#!/usr/bin/env tsx

/**
 * 恢复卡住的视频任务
 * 从 evolink 获取实际状态，更新数据库
 */

import "dotenv/config";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { getProvider } from "@/ai";
import { videoService } from "@/services/video";

async function checkEvolinkTask(taskId: string) {
  const provider = getProvider("evolink");
  return await provider.getTaskStatus(taskId);
}

async function recoverVideo(videoUuid: string) {
  console.log(`\n🔧 恢复视频: ${videoUuid}`);

  // 1. 从数据库获取视频信息
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.uuid, videoUuid))
    .limit(1);

  if (!video) {
    console.log(`   ❌ 视频不存在`);
    return;
  }

  console.log(`   状态: ${video.status}`);
  console.log(`   Provider: ${video.provider}`);
  console.log(`   任务ID: ${video.externalTaskId}`);

  if (!video.externalTaskId) {
    console.log(`   ⚠️  没有 externalTaskId，无法查询`);
    return;
  }

  // 2. 从 evolink 获取实际状态
  try {
    const taskStatus = await checkEvolinkTask(video.externalTaskId);
    console.log(`   Evolink 状态: ${taskStatus.status}`);
    console.log(`   进度: ${taskStatus.progress}%`);

    // 3. 如果已完成，更新数据库
    if (taskStatus.status === "completed" && taskStatus.videoUrl) {
      console.log(`   ✅ 任务已完成，开始更新数据库...`);

      // 触发完成流程（下载视频、上传到R2、结算积分等）
      const result = {
        taskId: taskStatus.taskId,
        provider: (video.provider || "evolink") as "evolink" | "kie",
        status: "completed" as const,
        progress: 100,
        videoUrl: taskStatus.videoUrl,
        thumbnailUrl: taskStatus.thumbnailUrl,
      };
      await videoService.tryCompleteGeneration(videoUuid, result);

      console.log(`   ✅ 恢复成功！`);
    } else if (taskStatus.status === "failed") {
      console.log(`   ❌ 任务已失败`);
      console.log(`   错误: ${taskStatus.error?.message || "Unknown error"}`);

      // 更新数据库为失败状态
      await db
        .update(videos)
        .set({
          status: "FAILED",
          errorMessage: taskStatus.error?.message || "Task failed",
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoUuid));

      console.log(`   ✅ 已更新为失败状态`);
    } else {
      console.log(`   ⏳  任务仍在处理中...`);
    }
  } catch (error) {
    console.error(`   ❌ 查询任务失败:`, error);
  }
}

async function main() {
  console.log("🔍 查找卡住的视频任务...\n");

  // 查找所有非完成状态的视频
  const stuckVideos = await db.select()
    .from(videos)
    .where(or(
      eq(videos.status, 'PENDING'),
      eq(videos.status, 'GENERATING'),
      eq(videos.status, 'UPLOADING')
    ))
    .orderBy(sql`"videos"."created_at" DESC`)
    .limit(20);

  if (stuckVideos.length === 0) {
    console.log("✅ 没有卡住的视频任务");
    process.exit(0);
  }

  console.log(`📊 发现 ${stuckVideos.length} 个未完成的视频`);

  // 恢复每个视频
  for (const video of stuckVideos) {
    await recoverVideo(video.uuid);
  }

  console.log("\n✅ 恢复完成");
}

main().catch(console.error);
