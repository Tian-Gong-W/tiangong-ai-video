import { ToolPageConfig } from "./types";
import { NEW_USER_GIFT } from "@/config/pricing-user";

/**
 * Text to Video 工具页面配置
 */
export const textToVideoConfig: ToolPageConfig = {
  // SEO 配置
  seo: {
    title: "Text to Video - Create Videos from Text with AI",
    description: "Transform your text descriptions into stunning videos using AI. Simply describe what you want, and watch Seedance AI models bring your vision to life.",
    keywords: [
      "text to video",
      "ai video generator",
      "video from text",
      "ai video creation",
      "seedance",
      "seedance 1.5",
      "text to video ai",
    ],
    ogImage: "/og-text-to-video.jpg",
  },

  // 生成器配置
  generator: {
    mode: "text-to-video",
    uiMode: "compact",

    defaults: {
      model: "seedance-1.5-pro",
      duration: 5,
      aspectRatio: "16:9",
      outputNumber: 1,
    },

    models: {
      available: ["seedance-1.5-pro", "seedance-1.0-pro-fast", "seedance-1.0-pro-quality"],
      default: "seedance-1.5-pro",
    },

    features: {
      showImageUpload: false,
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder: "Describe the video you want to create... e.g., 'A serene mountain landscape at sunset with birds flying'",

    settings: {
      showDuration: true,
      showAspectRatio: true,
      showQuality: false,
      showOutputNumber: false,
      showAudioGeneration: true,

      durations: [2, 4, 5, 6, 8, 10, 12],
      aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    },
  },

  // Landing Page 配置
  landing: {
    hero: {
      title: "Create Stunning Videos from Text",
      description: "Describe your vision in plain text and let AI bring it to life. From cinematic scenes to product showcases, the possibilities are endless.",
      ctaText: "Start Creating",
      ctaSubtext: `${NEW_USER_GIFT.credits} free credits to try`,
    },

    examples: [
      {
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
        title: "Cinematic Mountain Scene",
        prompt: "A majestic mountain range at golden hour, camera slowly flying through valleys",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
        title: "Urban City Timelapse",
        prompt: "New York City timelapse at night, cars leaving light trails, buildings glowing",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        title: "Ocean Sunset",
        prompt: "Calm ocean waves at sunset, camera slowly zooming out, peaceful atmosphere",
      },
    ],

    features: [
      "Simply describe what you want to see",
      "Access to Seedance AI models (1.5 Pro, 1.0 Fast, 1.0 Quality)",
      "Cinematic quality up to 1080p",
      "Generate audio and sound effects automatically",
      "Multiple aspect ratios for any platform",
    ],

    supportedModels: [
      { name: "Seedance 1.5 Pro", provider: "ByteDance", color: "#10b981" },
      { name: "Seedance 1.0 Fast", provider: "ByteDance", color: "#34d399" },
      { name: "Seedance 1.0 Quality", provider: "ByteDance", color: "#059669" },
    ],

    stats: {
      videosGenerated: "1M+",
      usersCount: "100K+",
      avgRating: 4.9,
    },
  },

  // 多语言 key 前缀
  i18nPrefix: "ToolPage.TextToVideo",
};
