import { getToolPageConfig, getToolPageConfigForProvider } from "@/config/tool-pages";
import { ToolPageLayout } from "@/components/tool/tool-page-layout";
import type { Locale } from "@/config/i18n-config";
import { buildAlternates, resolveOgImage } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getConfiguredAIProvider } from "@/ai";

interface TextToVideoPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: TextToVideoPageProps) {
  const { locale } = await params;
  const config = getToolPageConfig("text-to-video");
  const alternates = buildAlternates("/text-to-video", locale);
  const ogImage = resolveOgImage(config.seo?.ogImage);

  return {
    title: config.seo?.title,
    description: config.seo?.description,
    keywords: config.seo?.keywords,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: config.seo?.title,
      description: config.seo?.description,
      url: alternates.canonical,
      siteName: siteConfig.name,
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo?.title,
      description: config.seo?.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function TextToVideoPage({ params }: TextToVideoPageProps) {
  const config = getToolPageConfigForProvider(
    "text-to-video",
    getConfiguredAIProvider()
  );
  const { locale } = await params;
  return (
    <ToolPageLayout
      config={config}
      locale={locale}
      toolRoute="text-to-video"
    />
  );
}
