import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, templates } from "@/db";

export const metadata = {
  title: "Templates - AI Video Template Gallery",
  description:
    "Browse curated AI video templates. Pick one, describe your scene, and generate in one click.",
};

interface TemplatesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { locale } = await params;

  const list = await db
    .select({
      templateKey: templates.templateKey,
      name: templates.name,
      coverUrl: templates.coverUrl,
      category: templates.category,
      creditsCost: templates.creditsCost,
      maxDuration: templates.maxDuration,
      aspectRatio: templates.aspectRatio,
      supportImageToVideo: templates.supportImageToVideo,
    })
    .from(templates)
    .where(eq(templates.isActive, true))
    .orderBy(asc(templates.sortOrder));

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">Template Gallery</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Pick a template, describe your scene, and let our AI engine generate the
          video for you.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/20 p-12 text-center text-muted-foreground">
          No templates yet. Templates added in the admin panel will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {list.map((t) => {
            const tool = t.supportImageToVideo ? "image-to-video" : "text-to-video";
            const ratioClass =
              t.aspectRatio === "9:16"
                ? "aspect-[9/16]"
                : t.aspectRatio === "1:1"
                  ? "aspect-square"
                  : "aspect-video";
            return (
              <Link
                key={t.templateKey}
                href={`/${locale}/${tool}?template=${encodeURIComponent(t.templateKey)}`}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-lg transition-all"
              >
                <div className={`relative ${ratioClass} bg-muted overflow-hidden`}>
                  {t.coverUrl ? (
                    <img
                      src={t.coverUrl}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted to-purple-500/20" />
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-xs text-white backdrop-blur">
                    {t.creditsCost} credits
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 rounded bg-muted/60">{t.category}</span>
                    {t.aspectRatio && <span>{t.aspectRatio}</span>}
                    {t.maxDuration != null && <span>· up to {t.maxDuration}s</span>}
                  </div>
                  <div className="mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Use this template →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
