"use client";

/**
 * 模板卡片封面媒体：默认展示封面图；带 previewVideoUrl 时 hover 无缝循环播放动态预览。
 */
export default function TemplateCardMedia({
  coverUrl,
  previewVideoUrl,
  name,
}: {
  coverUrl: string | null;
  previewVideoUrl: string | null;
  name: string;
}) {
  return (
    <div className="absolute inset-0">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-purple-500/20" />
      )}
      {previewVideoUrl ? (
        <video
          src={previewVideoUrl}
          muted
          loop
          playsInline
          preload="none"
          onMouseEnter={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      ) : null}
      {previewVideoUrl ? (
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur pointer-events-none">
          ▶ Hover to preview
        </span>
      ) : null}
    </div>
  );
}
