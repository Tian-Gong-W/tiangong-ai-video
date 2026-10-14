import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, templates } from "@/db";

import type { Locale } from "@/config/i18n-config";
import { i18n } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";
import { buildAlternates, resolveOgImage } from "@/lib/seo";

import TemplateCardMedia from "./templates/template-card-media";

/**
 * 营销首页门面（Genix AI facade）
 * 结构：hero（chips + 双行大标题 + 双 CTA）→ 六特性卡 → 热门模板条（DB 就绪后自动出现）→ 底部双 CTA
 * 热门模板条查库失败/无数据时静默隐藏，门面本身不依赖数据库。
 */

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

interface PageMetadataProps {
  params: Promise<{ locale: Locale }>;
}

const HERO_CHIPS = [
  "🎞️ Any Image",
  "🧍 Any Character",
  "💃 Any Movement",
  "✨ Creative Freedom",
];

const FEATURES = [
  { icon: "📸", title: "Bring Photos to Life" },
  { icon: "🧍", title: "Create Any Character" },
  { icon: "🎨", title: "Animate in Any Style" },
  { icon: "🎬", title: "Cinematic Scenes" },
  { icon: "💃", title: "Make Any Movement" },
  { icon: "📦", title: "Turn Any Object to Video" },
];

export async function generateMetadata({ params }: PageMetadataProps) {
  const { locale } = await params;

  const title = `${siteConfig.name} — Upload Any Image, Make It Move`;
  const description =
    "Your Image. Your Imagination. Create any character movement, scene or story. The possibilities are endless.";

  const canonicalUrl = `${siteConfig.url}${locale === i18n.defaultLocale ? "" : `/${locale}`}`;
  const alternates = buildAlternates("/", locale);
  const ogImage = resolveOgImage();

  return {
    title,
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // 热门模板条：取启用模板前 8 条；DB 未就绪/为空时隐藏该区块
  let hot: Array<{
    templateKey: string;
    name: string;
    coverUrl: string | null;
    previewVideoUrl: string | null;
    aspectRatio: string | null;
    creditsCost: number;
  }> = [];
  try {
    hot = await db
      .select({
        templateKey: templates.templateKey,
        name: templates.name,
        coverUrl: templates.coverUrl,
        previewVideoUrl: templates.previewVideoUrl,
        aspectRatio: templates.aspectRatio,
        creditsCost: templates.creditsCost,
      })
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(asc(templates.sortOrder))
      .limit(8);
  } catch {
    hot = [];
  }

  const createHref = `/${locale}/image-to-video`;
  const dramaHref = `/${locale}/templates`;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-14 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(600px_240px_at_50%_0%,rgba(168,85,247,0.25),transparent_70%)]" />
        <div className="relative">
          <div className="mb-7 flex flex-wrap justify-center gap-2">
            {HERO_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            Upload any image,
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 bg-clip-text text-transparent">
              make it move anyway you want
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground">
            Your Image. Your Imagination. — Create any character movement, scene
            or story. The possibilities are endless.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={createHref}
              className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 px-7 py-3 text-[15px] font-semibold text-white transition hover:brightness-110"
            >
              Create Video
            </Link>
            <Link
              href={dramaHref}
              className="rounded-xl border border-border px-7 py-3 text-[15px] font-semibold transition hover:bg-white/5"
            >
              Watch Short Drama
            </Link>
          </div>
        </div>
      </section>

      {/* Your Image. Your Imagination. */}
      <section className="px-4">
        <h2 className="text-center text-2xl font-bold">
          Your Image. Your Imagination.
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Create any character movement, scene or story. The possibilities are
          endless.
        </p>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 text-center transition hover:border-purple-500/50"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <b className="font-semibold">{f.title}</b>
            </div>
          ))}
        </div>
      </section>

      {/* Hot templates strip（数据库就绪后自动出现） */}
      {hot.length > 0 && (
        <section className="mt-16 px-4">
          <h2 className="text-center text-2xl font-bold">Hot Templates</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Pick a template, describe your scene, and let our AI engine
            generate the video for you.
          </p>
          <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {hot.map((t) => {
              const ratioClass =
                t.aspectRatio === "9:16"
                  ? "aspect-[9/16]"
                  : t.aspectRatio === "1:1"
                    ? "aspect-square"
                    : "aspect-video";
              return (
                <Link
                  key={t.templateKey}
                  href={`/${locale}/image-to-video?template=${encodeURIComponent(
                    t.templateKey
                  )}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60"
                >
                  <div className={`relative ${ratioClass} overflow-hidden bg-muted`}>
                    <TemplateCardMedia
                      coverUrl={t.coverUrl}
                      previewVideoUrl={t.previewVideoUrl}
                      name={t.name}
                    />
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur">
                      {t.creditsCost} credits
                    </span>
                  </div>
                  <div className="truncate p-3 text-sm font-medium">{t.name}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mt-16 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={dramaHref}
            className="rounded-xl border border-border px-7 py-3 text-[15px] font-semibold transition hover:bg-white/5"
          >
            Watch Short Drama
          </Link>
          <Link
            href={createHref}
            className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 px-7 py-3 text-[15px] font-semibold text-white transition hover:brightness-110"
          >
            Create Video
          </Link>
        </div>
      </section>
    </div>
  );
}
