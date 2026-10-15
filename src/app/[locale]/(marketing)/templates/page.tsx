import { asc, eq } from "drizzle-orm";
import { db, templates } from "@/db";
import TemplateGallery from "./template-gallery";

export const metadata = {
  title: "Templates - AI Video Template Gallery",
  description:
    "Browse curated AI video templates. Pick one, upload your image, and generate in one click.",
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
      previewVideoUrl: templates.previewVideoUrl,
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
          Pick a template, upload your image, and let our AI engine generate the
          video for you.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/20 p-12 text-center text-muted-foreground">
          No templates yet. Templates added in the admin panel will appear here.
        </div>
      ) : (
        <TemplateGallery items={list} locale={locale} />
      )}
    </div>
  );
}
