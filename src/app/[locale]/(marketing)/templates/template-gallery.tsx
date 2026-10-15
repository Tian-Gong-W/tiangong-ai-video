"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TemplateCardMedia from "./template-card-media";

/**
 * 模板画廊（客户端）：分类 tab 过滤 + 分批渲染（Load more）。
 * 1100+ 条模板一次性渲染所有 <img>/<video> 会拖垮页面，因此只挂载已展示的卡片。
 */

export interface GalleryTemplate {
  templateKey: string;
  name: string;
  coverUrl: string | null;
  previewVideoUrl: string | null;
  category: string;
  creditsCost: number;
  maxDuration: number | null;
  aspectRatio: string | null;
  supportImageToVideo: boolean;
}

const PAGE_SIZE = 48;

const CATEGORY_LABELS: Record<string, string> = {
  "nsfw-video": "Video",
  "nsfw-movie": "Movie",
  "nsfw-photo": "Photo",
  pixel: "Pixel",
  anime: "Anime",
  cyberpunk: "Cyberpunk",
  ghibli: "Ghibli",
  figure: "Figure",
  magic: "Magic",
};

export default function TemplateGallery({
  items,
  locale,
}: {
  items: GalleryTemplate[];
  locale: string;
}) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of items) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const [active, setActive] = useState<string>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((t) => t.category === active)),
    [items, active]
  );

  const shown = filtered.slice(0, visible);

  const switchCategory = (key: string) => {
    setActive(key);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      {/* 分类 tab */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => switchCategory("all")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            active === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          All ({items.length})
        </button>
        {categories.map(([key, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchCategory(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {CATEGORY_LABELS[key] ?? key} ({count})
          </button>
        ))}
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {shown.map((t) => {
          const ratioClass =
            t.aspectRatio === "9:16"
              ? "aspect-[9/16]"
              : t.aspectRatio === "1:1"
                ? "aspect-square"
                : "aspect-video";
          return (
            <Link
              key={t.templateKey}
              href={`/${locale}/image-to-video?template=${encodeURIComponent(t.templateKey)}`}
              className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-lg transition-all"
            >
              <div className={`relative ${ratioClass} bg-muted overflow-hidden`}>
                <TemplateCardMedia
                  coverUrl={t.coverUrl}
                  previewVideoUrl={t.previewVideoUrl}
                  name={t.name}
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-xs text-white backdrop-blur">
                  {t.creditsCost} credits
                </span>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium truncate" title={t.name}>
                  {t.name}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  {t.aspectRatio && <span>{t.aspectRatio}</span>}
                  {t.maxDuration != null && <span>· {t.maxDuration}s</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load more */}
      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-border px-8 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
