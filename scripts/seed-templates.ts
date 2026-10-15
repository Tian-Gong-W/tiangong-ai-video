/**
 * 模板种子导入（参考站选品 60 条：风格/特效/LoRA 照片/视频/电影模板）
 *
 * 用法：
 *   docker compose --profile tools run --rm seed
 *   或本地：DATABASE_URL=... pnpm tsx scripts/seed-templates.ts
 *
 * 幂等：按 template_key upsert；已存在的 workflow_json 不会被覆盖
 * （在 /admin/templates 粘贴过的真实工作流会被保留）。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

type SeedEntry = {
  key: string;
  name: string;
  cover: string;
  preview?: string;
  category: string;
  credits: number;
  duration: number;
  ratio: string;
  i2v: boolean;
  sort: number;
};

const here = dirname(fileURLToPath(import.meta.url));
const seed: SeedEntry[] = JSON.parse(
  readFileSync(join(here, "seed-templates.json"), "utf-8"),
);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * 占位工作流骨架（ComfyUI API 格式）。
 * ⚠️ 真实出片前，请在 /admin/templates 为每个模板粘贴带 LoRA 的完整工作流。
 * 支持占位符：<%seed%> <%prompt%> <%negative_prompt%> <%image_url%> <%width%> <%height%>
 */
const PLACEHOLDER_WORKFLOW = {
  "4": {
    class_type: "CheckpointLoaderSimple",
    inputs: { ckpt_name: "wan2.2.safetensors" },
  },
  "5": {
    class_type: "EmptySD3LatentImage",
    inputs: { width: "<%width%>", height: "<%height%>", batch_size: 1 },
  },
  "6": {
    class_type: "CLIPTextEncode",
    inputs: { text: "<%prompt%>", clip: ["4", 1] },
  },
  "7": {
    class_type: "CLIPTextEncode",
    inputs: { text: "<%negative_prompt%>", clip: ["4", 1] },
  },
  "3": {
    class_type: "KSampler",
    inputs: {
      seed: "<%seed%>",
      steps: 20,
      cfg: 6,
      sampler_name: "euler",
      scheduler: "normal",
      denoise: 1,
      model: ["4", 0],
      positive: ["6", 0],
      negative: ["7", 0],
      latent_image: ["5", 0],
    },
  },
  "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
  "9": {
    class_type: "SaveImage",
    inputs: { images: ["8", 0], filename_prefix: "tpl" },
  },
};

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  const rows = await sql.begin(async (tx) => {
    const results = [];
    for (const e of seed) {
      const r = await tx`
        INSERT INTO templates
          (template_key, name, cover_url, preview_video_url, category,
           workflow_json, engine, credits_cost, max_duration, aspect_ratio,
           support_image_to_video, sort_order, is_active)
        VALUES
          (${e.key}, ${e.name}, ${e.cover}, ${e.preview ?? null}, ${e.category},
           ${JSON.stringify(PLACEHOLDER_WORKFLOW)}::jsonb, 'comfyui',
           ${e.credits}, ${e.duration}, ${e.ratio}, ${e.i2v}, ${e.sort}, true)
        ON CONFLICT (template_key) DO UPDATE SET
          name = EXCLUDED.name,
          cover_url = EXCLUDED.cover_url,
          preview_video_url = COALESCE(EXCLUDED.preview_video_url, templates.preview_video_url),
          category = EXCLUDED.category,
          credits_cost = EXCLUDED.credits_cost,
          max_duration = EXCLUDED.max_duration,
          aspect_ratio = EXCLUDED.aspect_ratio,
          support_image_to_video = EXCLUDED.support_image_to_video,
          sort_order = EXCLUDED.sort_order,
          is_active = true,
          updated_at = now()
        RETURNING id, template_key
      `;
      results.push(r[0]);
    }
    return results;
  });
  console.log(`seeded ${rows.length} templates (existing workflow_json preserved)`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
