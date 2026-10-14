import { getToolPageConfig, getToolPageConfigForProvider } from "@/config/tool-pages";
import { ToolPageLayout } from "@/components/tool/tool-page-layout";
import type { Locale } from "@/config/i18n-config";
import { buildAlternates, resolveOgImage } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getConfiguredAIProvider } from "@/ai";

interface ReferenceToVideoPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: ReferenceToVideoPageProps) {
  const { locale } = await params;
  const config = getToolPageConfig("reference-to-video");
  const alternates = buildAlternates("/reference-to-video", locale);
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

export default async function ReferenceToVideoPage({ params }: ReferenceToVideoPageProps) {
  const config = getToolPageConfigForProvider(
    "reference-to-video",
    getConfiguredAIProvider()
  );
  const { locale } = await params;
  return (
    <ToolPageLayout
      config={config}
      locale={locale}
      toolRoute="reference-to-video"
    />
  );
}
