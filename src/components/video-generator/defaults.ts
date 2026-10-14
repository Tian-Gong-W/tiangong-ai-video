/**
 * Default Configuration for VideoGeneratorInput
 *
 * These defaults are provided as a convenience for quick setup.
 * You can override any of these by passing your own data to the component.
 *
 * @example
 * ```tsx
 * // Use all defaults
 * <VideoGeneratorInput />
 *
 * // Override only video models
 * <VideoGeneratorInput
 *   config={{
 *     videoModels: myCustomModels,
 *     // Other configs will use defaults
 *   }}
 * />
 *
 * // Completely custom configuration
 * <VideoGeneratorInput
 *   config={myCompleteConfig}
 * />
 * ```
 */

import type {
  VideoModel,
  ImageModel,
  GeneratorMode,
  ImageStyle,
  PromptTemplate,
  GeneratorConfig,
  GeneratorDefaults,
  GeneratorTexts,
  OutputNumberOption,
} from "./types";

// ============================================================================
// Video Models
// ============================================================================

export const DEFAULT_VIDEO_MODELS: VideoModel[] = [
  // ============================================================================
  // Seedance Series (Primary - APImart)
  // ============================================================================
  {
    id: "seedance-1.5-pro",
    name: "Seedance 1.5 Pro",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#10b981",
    description: "Text/Image/Frames to video with audio",
    maxDuration: "12 sec",
    creditCost: 16, // 最小 4s 720p 有音频 = 16 积分 (4秒 × 4积分/秒)
    durations: ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 2,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
    supportsAudio: true,
  },
  {
    id: "seedance-1.0-pro-fast",
    name: "Seedance 1.0 Fast",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#34d399",
    description: "Fast video generation, lower cost",
    maxDuration: "12 sec",
    creditCost: 15, // 5s 720p = 5×3 = 15
    durations: ["2s", "4s", "5s", "6s", "8s", "10s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 1,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
  },
  {
    id: "seedance-1.0-pro-quality",
    name: "Seedance 1.0 Quality",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1754894158793-1e7ef687-c3c1-4f44-8b06-d044a8121f66.svg",
    color: "#059669",
    description: "Highest quality video generation",
    maxDuration: "12 sec",
    creditCost: 25, // 5s 720p = 5×5 = 25
    durations: ["2s", "4s", "5s", "6s", "8s", "10s", "12s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    resolutions: ["480P", "720P", "1080P"],
    maxImages: 1,
    imageConstraints: {
      maxSizeMB: 10,
      formats: ["jpg", "jpeg", "png", "webp"],
    },
  },

  // ============================================================================
  // Hidden Models (kept for reference, filtered out by enabled: false in pricing)
  // ============================================================================
  {
    id: "sora-2",
    name: "Sora 2",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/test/cm3pol28q0000ojuuyeo77e36/image/1759998830447-10c6484e-786d-4d05-a2c4-f0c929b1042b.svg",
    color: "#000000",
    description: "OpenAI's advanced video generation model",
    maxDuration: "15 sec",
    creditCost: 2,
    durations: ["10s", "15s"],
    aspectRatios: ["16:9", "9:16"],
    maxImages: 1,
  },
  {
    id: "wan2.6",
    name: "Wan 2.6",
    icon: "https://videocdn.pollo.ai/model-icon/svg/Group.svg",
    color: "#ff6a00",
    description: "Text/Image/Reference video to video with audio support",
    maxDuration: "10 sec",
    creditCost: 25,
    durations: ["5s", "10s"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    resolutions: ["720P", "1080P"],
    maxImages: 1,
    supportsAudio: true,
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    icon: "https://videocdn.pollo.ai/web-cdn/pollo/production/cm3po9yyf0003oh0c2iyt8ajy/image/1753259785486-de7c53b0-9576-4d3e-a76a-a94fcac57bf1.svg",
    color: "#4285f4",
    description: "Google's video generation with reference support",
    maxDuration: "8 sec",
    creditCost: 10,
    durations: ["8s"],
    aspectRatios: ["16:9", "9:16"],
    maxImages: 2,
    outputNumbers: [
      { value: 1 },
      { value: 2, isPro: true },
      { value: 3, isPro: true },
      { value: 4, isPro: true },
    ],
  },
];

// ============================================================================
// Image Models (placeholder for future use)
// ============================================================================

export const DEFAULT_IMAGE_MODELS: ImageModel[] = [];

// ============================================================================
// Generation Modes
// ============================================================================

export const DEFAULT_VIDEO_MODES: GeneratorMode[] = [
  {
    id: "text-image-to-video",
    name: "Text/Image to Video",
    icon: "text",
    uploadType: "single",
    description: "Generate video from text prompt with optional reference image",
    // Supports T2V and I2V (upload image for I2V mode)
    // Sora, Wan, Veo, Seedance
    supportedModels: [
      "seedance-1.5-pro",
      "seedance-1.0-pro-fast",
      "seedance-1.0-pro-quality",
      "sora-2",
      "wan2.6",
      "veo-3.1",
    ],
  },
  {
    id: "frames-to-video",
    name: "Frames to Video",
    icon: "frames",
    uploadType: "start-end",
    description: "Generate video from start and end frame images",
    // Seedance first-last-frame mode
    supportedModels: ["seedance-1.5-pro"],
    aspectRatios: ["16:9", "9:16"],
  },
  {
    id: "reference-to-video",
    name: "Reference to Video",
    icon: "reference",
    uploadType: "characters",
    description: "Generate video using character reference images or videos",
    // Seedance reference mode
    supportedModels: ["seedance-1.5-pro"],
    // REFERENCE mode only supports 16:9 (Veo), Wan has more options but switches dynamically
    aspectRatios: ["16:9"],
    // REFERENCE mode fixed 8s (Veo)
    durations: ["8s"],
  },
];

export const DEFAULT_IMAGE_MODES: GeneratorMode[] = [];

// ============================================================================
// Image Styles
// ============================================================================

export const DEFAULT_IMAGE_STYLES: ImageStyle[] = [
  { id: "auto", name: "Auto" },
  { id: "ghibli", name: "Ghibli" },
  { id: "ultra-realism", name: "Ultra Realism" },
  { id: "pixel-art", name: "Pixel Art" },
  { id: "japanese-anime", name: "Japanese Anime" },
  { id: "3d-render", name: "3D Render" },
  { id: "steampunk", name: "Steampunk" },
  { id: "watercolor", name: "Watercolor" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "oil-painting", name: "Oil Painting" },
  { id: "comic-book", name: "Comic Book" },
  { id: "minimalist", name: "Minimalist" },
];

// ============================================================================
// Aspect Ratios
// ============================================================================

// Based on API docs, video models mainly support 16:9 and 9:16
export const DEFAULT_VIDEO_ASPECT_RATIOS = ["16:9", "9:16"];
export const DEFAULT_IMAGE_ASPECT_RATIOS = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];

// ============================================================================
// Video Options
// ============================================================================

// Different models support different durations - common options listed here
// sora-2: 10s, 15s
// wan2.6: 5s, 10s
// veo-3.1: 8s
// seedance-1.5-pro: 4s-12s
export const DEFAULT_DURATIONS = ["4s", "5s", "6s", "8s", "10s", "12s", "15s"];
export const DEFAULT_RESOLUTIONS: string[] = [];

// ============================================================================
// Output Numbers (with Pro support)
// ============================================================================

export const DEFAULT_VIDEO_OUTPUT_NUMBERS: OutputNumberOption[] = [
  { value: 1 },
  { value: 2, isPro: true },
  { value: 3, isPro: true },
  { value: 4, isPro: true },
];

export const DEFAULT_IMAGE_OUTPUT_NUMBERS: OutputNumberOption[] = [
  { value: 1 },
  { value: 2, isPro: true },
  { value: 4, isPro: true },
  { value: 8, isPro: true },
];

// ============================================================================
// Prompt Templates
// ============================================================================

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "1",
    text: "Cozy Christmas Room",
    image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=100",
  },
  { id: "2", text: "workaholic" },
  {
    id: "3",
    text: "Quiet Resolve",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100",
  },
  { id: "4", text: "Cinematic Drama" },
  { id: "5", text: "Nature Documentary" },
  {
    id: "6",
    text: "Urban Street Photography",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100",
  },
  { id: "7", text: "Ethereal Fantasy World" },
  {
    id: "8",
    text: "Retro 80s Aesthetic",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100",
  },
  { id: "9", text: "Minimalist Product Shot" },
  {
    id: "10",
    text: "Epic Landscape View",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100",
  },
];

// ============================================================================
// Combined Default Config
// ============================================================================

/**
 * Complete default configuration
 * Use this as a starting point or reference
 */
export const DEFAULT_CONFIG: GeneratorConfig = {
  videoModels: DEFAULT_VIDEO_MODELS,
  imageModels: DEFAULT_IMAGE_MODELS,
  videoModes: DEFAULT_VIDEO_MODES,
  imageModes: DEFAULT_IMAGE_MODES,
  imageStyles: DEFAULT_IMAGE_STYLES,
  promptTemplates: DEFAULT_PROMPT_TEMPLATES,
  aspectRatios: {
    video: DEFAULT_VIDEO_ASPECT_RATIOS,
    image: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  durations: DEFAULT_DURATIONS,
  resolutions: DEFAULT_RESOLUTIONS,
  outputNumbers: {
    video: DEFAULT_VIDEO_OUTPUT_NUMBERS,
    image: DEFAULT_IMAGE_OUTPUT_NUMBERS,
  },
};

/**
 * Default initial values
 */
export const DEFAULT_DEFAULTS: GeneratorDefaults = {
  generationType: "video",
  videoModel: "seedance-1.5-pro",
  imageModel: "flux-pro",
  videoMode: "text-image-to-video",
  imageMode: "text-to-image",
  videoAspectRatio: "16:9",
  imageAspectRatio: "1:1",
  duration: "5s",        // seedance default
  resolution: "720P",    // default for models with resolution support
  videoOutputNumber: 1,
  imageOutputNumber: 1,
  imageStyle: "auto",
};

/**
 * Default video quality options
 */
export const DEFAULT_QUALITIES = ["standard", "high"];

/**
 * Default English texts
 */
export const DEFAULT_TEXTS_EN: GeneratorTexts = {
  videoPlaceholder: "Enter your idea to generate video",
  imagePlaceholder: "Enter your idea to generate image",
  aiVideo: "AI Video",
  aiImage: "AI Image",
  credits: "Credits",
  videoModels: "Video Models",
  imageModels: "Image Models",
  selectStyle: "Select Style",
  aspectRatio: "Aspect Ratio",
  videoLength: "Video Length",
  resolution: "Resolution",
  outputNumber: "Output Number",
  numberOfImages: "Number of Images",
  promptTooLong: "Prompt too long. Please shorten it.",
  start: "Start",
  end: "End",
  optional: "(Opt)",
};

/**
 * Default Chinese texts
 */
export const DEFAULT_TEXTS_ZH: GeneratorTexts = {
  videoPlaceholder: "输入你的想法来生成视频",
  imagePlaceholder: "输入你的想法来生成图片",
  aiVideo: "AI 视频",
  aiImage: "AI 图片",
  credits: "积分",
  videoModels: "视频模型",
  imageModels: "图片模型",
  selectStyle: "选择风格",
  aspectRatio: "宽高比",
  videoLength: "视频时长",
  resolution: "分辨率",
  outputNumber: "输出数量",
  numberOfImages: "图片数量",
  promptTooLong: "提示词过长，请缩短",
  start: "起始",
  end: "结束",
  optional: "(可选)",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Merge user config with defaults
 * User config takes priority
 */
export function mergeConfig(userConfig?: GeneratorConfig): GeneratorConfig {
  if (!userConfig) return DEFAULT_CONFIG;

  return {
    videoModels: userConfig.videoModels ?? DEFAULT_CONFIG.videoModels,
    imageModels: userConfig.imageModels ?? DEFAULT_CONFIG.imageModels,
    videoModes: userConfig.videoModes ?? DEFAULT_CONFIG.videoModes,
    imageModes: userConfig.imageModes ?? DEFAULT_CONFIG.imageModes,
    imageStyles: userConfig.imageStyles ?? DEFAULT_CONFIG.imageStyles,
    promptTemplates: userConfig.promptTemplates ?? DEFAULT_CONFIG.promptTemplates,
    aspectRatios: {
      video: userConfig.aspectRatios?.video ?? DEFAULT_CONFIG.aspectRatios?.video,
      image: userConfig.aspectRatios?.image ?? DEFAULT_CONFIG.aspectRatios?.image,
    },
    durations: userConfig.durations ?? DEFAULT_CONFIG.durations,
    resolutions: userConfig.resolutions ?? DEFAULT_CONFIG.resolutions,
    outputNumbers: {
      video: userConfig.outputNumbers?.video ?? DEFAULT_CONFIG.outputNumbers?.video,
      image: userConfig.outputNumbers?.image ?? DEFAULT_CONFIG.outputNumbers?.image,
    },
  };
}

/**
 * Merge user defaults with system defaults
 */
export function mergeDefaults(userDefaults?: GeneratorDefaults): GeneratorDefaults {
  if (!userDefaults) return DEFAULT_DEFAULTS;

  return {
    ...DEFAULT_DEFAULTS,
    ...userDefaults,
  };
}

/**
 * Get texts for a locale
 */
export function getTexts(locale?: string, customTexts?: GeneratorTexts): GeneratorTexts {
  const baseTexts = locale === "zh" ? DEFAULT_TEXTS_ZH : DEFAULT_TEXTS_EN;

  if (!customTexts) return baseTexts;

  return {
    ...baseTexts,
    ...customTexts,
  };
}
