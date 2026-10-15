import { asc, eq } from "drizzle-orm";
import { ArrowRight, Image as ImageIcon, Play, Upload, UserRound, WandSparkles } from "lucide-react";
import Link from "next/link";
import { db, templates } from "@/db";

import type { Locale } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";
import { buildAlternates } from "@/lib/seo";
import { GenixMobileMenu } from "@/components/genix-mobile-menu";

/**
 * 营销首页门面（Genix AI facade）
 * 富门面（hero 大图 + 六特性卡 + 页脚）+ 热门模板条（DB 就绪后自动出现，失败/为空时静默隐藏）。
 */

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

interface PageMetadataProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageMetadataProps) {
  const { locale } = await params;
  const title = "Genix AI — Upload Any Image, Make It Move";
  const description = "Bring any image to life with expressive AI video generation.";
  const alternates = buildAlternates("/", locale);
  return {
    title,
    description,
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    openGraph: { title, description, url: siteConfig.url, siteName: "Genix AI", type: "website" },
  };
}

const cards = [
  ["/genix/card-life.png", "Bring Photos to Life"],
  ["/genix/card-character.png", "Create Any Character"],
  ["/genix/card-style.png", "Animate in Any Style"],
  ["/genix/card-cinematic.png", "Cinematic Scenes"],
  ["/genix/card-movement.png", "Make Any Movement"],
  ["/genix/card-object.png", "Turn Any Object to Video"],
];

function GradientText({ children }: { children: React.ReactNode }) {
  return <span className="genix-gradient-text">{children}</span>;
}

function CreateButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`genix-cta${compact ? " genix-cta-compact" : ""}`} href="/image-to-video">
      <Upload size={compact ? 15 : 17} strokeWidth={2.4} aria-hidden="true" />
      <span>Watch Short Drama or Create Video</span>
      <ArrowRight size={compact ? 17 : 20} strokeWidth={2.5} aria-hidden="true" />
    </Link>
  );
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

  const templatesHref = `/${locale}/templates`;

  return (
    <div className="genix-page">
      {/* ── Fixed Header ── */}
      <header className="genix-header">
        <Link href="/" className="genix-logo">
          Genix <GradientText>AI</GradientText>
        </Link>

        {/* Desktop nav */}
        <nav className="genix-nav" aria-label="Primary navigation">
          <Link href="/image-to-video">Create</Link>
          <Link href="#showcase">Short Films</Link>
          <Link href={templatesHref}>Gallery</Link>
          <Link href="#contact">Contact</Link>
        </nav>

        <div className="genix-header-actions">
          <Link href="/image-to-video" className="genix-start">
            Get Started
          </Link>
          {/* Mobile hamburger (client component) */}
          <GenixMobileMenu />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="genix-hero">
        {/* Right-side background image (absolute) */}
        <div className="genix-hero-media" aria-hidden="true">
          <img src="/genix/hero-room.png" alt="" />
        </div>

        <div className="genix-container genix-hero-inner">
          {/* Left copy */}
          <div className="genix-hero-copy">
            <h1>
              Upload <GradientText>Any Image,</GradientText>
            </h1>
            <p className="genix-subtitle">And make it move anyway you want</p>
            <CreateButton />
            <div className="genix-feature-row">
              <div>
                <ImageIcon size={30} strokeWidth={1.8} aria-hidden="true" />
                <span>Any Image</span>
              </div>
              <div>
                <UserRound size={30} strokeWidth={1.8} aria-hidden="true" />
                <span>Any Character</span>
              </div>
              <div>
                <WandSparkles size={30} strokeWidth={1.8} aria-hidden="true" />
                <span>Any Movement</span>
              </div>
              <div>
                <span className="genix-star" aria-hidden="true">
                  ✦
                </span>
                <span>Creative Freedom</span>
              </div>
            </div>
          </div>

          {/* Right floating visual: Polaroid → arrow → video card */}
          <div className="genix-hero-visual" aria-hidden="true">
            <figure className="genix-polaroid">
              <img src="/genix/hero-room.png" alt="" />
            </figure>

            <span className="genix-flow-arrow">
              <svg viewBox="0 0 40 24" aria-hidden="true">
                <path
                  d="M2 12h30m0 0-8-7m8 7-8 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <figure className="genix-video-card">
              <img src="/genix/hero-room.png" alt="" />
              <span className="genix-play-btn">
                <Play size={24} fill="currentColor" aria-hidden="true" />
              </span>
              <span className="genix-duration">0:08</span>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Showcase ── */}
      <section id="showcase" className="genix-showcase">
        <div className="genix-container">
          <div className="genix-showcase-heading">
            <h2>
              Your Image. <GradientText>Your Imagination.</GradientText>
            </h2>
            <p>Create any character movement, scene or story. The possibilities are endless.</p>
          </div>
        </div>

        <div className="genix-card-grid">
          {cards.map(([src, label]) => (
            <Link href="/image-to-video" className="genix-card" key={src} aria-label={label}>
              <img src={src} alt={label} />
              <span className="genix-play-btn">
                <Play size={21} fill="currentColor" aria-hidden="true" />
              </span>
              <span className="genix-card-overlay">
                <Play size={14} fill="currentColor" aria-hidden="true" />
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div className="genix-showcase-cta">
          <CreateButton compact />
        </div>
      </section>

      {/* ── Hot templates strip（数据库就绪后自动出现） ── */}
      {hot.length > 0 && (
        <section id="hot-templates" className="genix-showcase">
          <div className="genix-container">
            <div className="genix-showcase-heading">
              <h2>
                Hot <GradientText>Templates</GradientText>
              </h2>
              <p>Pick a template, describe your scene, and let our AI engine generate the video for you.</p>
            </div>
          </div>

          <div className="genix-container genix-tpl-grid">
            {hot.map((t) => {
              const ratioClass =
                t.aspectRatio === "9:16"
                  ? "genix-tpl-916"
                  : t.aspectRatio === "1:1"
                    ? "genix-tpl-11"
                    : "genix-tpl-169";
              return (
                <Link
                  key={t.templateKey}
                  href={`/${locale}/image-to-video?template=${encodeURIComponent(t.templateKey)}`}
                  className="genix-tpl-card"
                  aria-label={t.name}
                >
                  <div className={`genix-tpl-cover ${ratioClass}`}>
                    {t.coverUrl ? <img src={t.coverUrl} alt={t.name} loading="lazy" /> : null}
                    <span className="genix-tpl-credits">{t.creditsCost} credits</span>
                  </div>
                  <div className="genix-tpl-name">{t.name}</div>
                </Link>
              );
            })}
          </div>

          <div className="genix-showcase-cta">
            <Link className="genix-cta genix-cta-compact" href={templatesHref}>
              <span>Browse all templates</span>
              <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer id="contact" className="genix-footer">
        <div className="genix-footer-brand">
          Genix <GradientText>AI</GradientText>
        </div>

        <nav className="genix-footer-links" aria-label="Footer navigation">
          <Link href="#">Privacy Policy</Link>
          <i aria-hidden="true" />
          <Link href="#">Terms</Link>
          <i aria-hidden="true" />
          <Link href="#">Contact</Link>
        </nav>

        <div className="genix-footer-social">
          <a href="#" aria-label="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
              <path d="M10 9.2l5 2.8-5 2.8z" fill="#070a20" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
          </a>
          <a href="#" aria-label="X / Twitter">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4l7.2 9.1L4.4 20h2.3l5.6-5.6 4.4 5.6H20l-7.5-9.5L19.4 4h-2.3l-5.2 5.2L8 4z" fill="currentColor" />
            </svg>
          </a>
          <small className="genix-footer-disclaimer">AI-generated content may vary.</small>
        </div>
      </footer>
    </div>
  );
}
