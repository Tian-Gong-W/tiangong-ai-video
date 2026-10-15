"use client";

/**
 * Generator Panel Component - Pollo.ai Style
 *
 * Tool page generator panel with dark theme design
 * Design inspired by https://pollo.ai
 * - Dark theme (#1A1A1A background)
 * - Uppercase labels for sections
 * - Purple accent color (#6D28D9)
 * - Dashed border upload area
 *
 * 前台策略：只暴露"模板选择"，不显示模型下拉。
 * 模型由模板决定，提交时内部强制 comfy-wan22-nsfw + templateId。
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/components/ui";
import { getAvailableModels, calculateModelCredits } from "@/config/credits";
import { Sparkles, Image as ImageIcon, X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SectionLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

function SectionLabel({ children, required, className }: SectionLabelProps) {
  return (
    <div className={cn("text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block", className)}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </div>
  );
}

interface GeneratorPanelProps {
  toolType: "image-to-video" | "text-to-video" | "reference-to-video";
  isLoading?: boolean;
  onSubmit?: (data: GeneratorData) => void;
  availableModelIds?: string[];
  defaultModelId?: string;
  /** 模板目录页链接（带 locale 前缀），未选模板时展示跳转入口 */
  templatesHref?: string;
  initialPrompt?: string;
  initialModelId?: string;
  initialDuration?: number;
  initialAspectRatio?: string;
  initialQuality?: string;
  initialImageUrl?: string;
  initialTemplateId?: string;
  initialTemplateName?: string;
  initialTemplateCoverUrl?: string;
  initialTemplateHasBuiltInPrompt?: boolean;
  initialTemplateCredits?: number;
  initialTemplateAspectRatio?: string;
  initialTemplateMaxDuration?: number;
}

export interface GeneratorData {
  toolType: string;
  model: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  quality?: string;
  outputNumber?: number;
  generateAudio?: boolean;
  imageFile?: File;
  imageUrl?: string;
  templateId?: string;
  estimatedCredits: number;
}

export function GeneratorPanel({
  toolType,
  isLoading = false,
  onSubmit,
  availableModelIds,
  defaultModelId,
  templatesHref,
  initialPrompt,
  initialModelId,
  initialDuration,
  initialAspectRatio,
  initialQuality,
  initialImageUrl,
  initialTemplateId,
  initialTemplateName,
  initialTemplateCoverUrl,
  initialTemplateHasBuiltInPrompt,
  initialTemplateCredits,
  initialTemplateAspectRatio,
  initialTemplateMaxDuration,
}: GeneratorPanelProps) {
  const models = getAvailableModels();
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [selectedModel, setSelectedModel] = useState(initialModelId || defaultModelId || models[0]?.id || "");
  const [duration, setDuration] = useState(initialDuration || 10);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio || "16:9");
  const [quality, setQuality] = useState(initialQuality || "standard");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  // 模板模式：前台只选模板；模型不暴露，提交时内部强制 comfy-wan22-nsfw
  const [template, setTemplate] = useState<{
    id: string;
    name?: string;
    coverUrl?: string;
    credits?: number;
    aspectRatio?: string;
    maxDuration?: number;
    /** 模板是否内置提示词（后台 defaultPrompt 已配置）：内置时隐藏 prompt 输入框 */
    hasBuiltInPrompt?: boolean;
  } | null>(
    initialTemplateId
      ? {
          id: initialTemplateId,
          name: initialTemplateName,
          coverUrl: initialTemplateCoverUrl,
          credits: initialTemplateCredits,
          aspectRatio: initialTemplateAspectRatio,
          maxDuration: initialTemplateMaxDuration,
          hasBuiltInPrompt: initialTemplateHasBuiltInPrompt,
        }
      : null
  );

  // 父组件异步加载模板信息后同步进来
  useEffect(() => {
    if (initialTemplateId) {
      setTemplate({
        id: initialTemplateId,
        name: initialTemplateName,
        coverUrl: initialTemplateCoverUrl,
        credits: initialTemplateCredits,
        aspectRatio: initialTemplateAspectRatio,
        maxDuration: initialTemplateMaxDuration,
        hasBuiltInPrompt: initialTemplateHasBuiltInPrompt,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  // 内嵌热门模板条：未选模板时在面板内直接选择（懒加载一次）
  const [tplList, setTplList] = useState<Array<{
    templateKey: string;
    name: string;
    coverUrl: string | null;
    creditsCost: number;
    aspectRatio: string | null;
    hasBuiltInPrompt: boolean;
  }>>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/templates", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((result) => {
        const list: Array<{
          templateKey: string;
          name: string;
          coverUrl: string | null;
          previewVideoUrl: string | null;
          category: string;
          engine: string;
          creditsCost: number;
          maxDuration: number;
          aspectRatio: string;
          supportImageToVideo: boolean;
          sortOrder: number;
          hasBuiltInPrompt?: boolean;
        }> = result?.data?.templates ?? [];
        const filtered =
          toolType === "text-to-video"
            ? list
            : list.filter((t) => t.supportImageToVideo);
        setTplList(
          filtered.map((t) => ({
            templateKey: t.templateKey,
            name: t.name,
            coverUrl: t.coverUrl,
            creditsCost: t.creditsCost,
            aspectRatio: t.aspectRatio,
            hasBuiltInPrompt: Boolean(t.hasBuiltInPrompt),
          }))
        );
        // URL 带 ?template= 直达且尚未选中时，用列表数据补全模板信息（含封面）
        setTemplate((prev) => {
          if (prev || !initialTemplateId) return prev;
          const match = filtered.find((t) => t.templateKey === initialTemplateId);
          if (!match) return prev;
          return {
            id: match.templateKey,
            name: match.name,
            coverUrl: match.coverUrl ?? undefined,
            credits: match.creditsCost,
            aspectRatio: match.aspectRatio ?? undefined,
            maxDuration: undefined,
            hasBuiltInPrompt: Boolean(match.hasBuiltInPrompt),
          };
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [toolType]);

  const pickTemplate = useCallback(
    (t: {
      templateKey: string;
      name: string;
      coverUrl: string | null;
      creditsCost: number;
      aspectRatio: string | null;
      hasBuiltInPrompt: boolean;
    }) => {
      setTemplate({
        id: t.templateKey,
        name: t.name,
        coverUrl: t.coverUrl ?? undefined,
        credits: t.creditsCost,
        aspectRatio: t.aspectRatio ?? undefined,
        maxDuration: undefined,
        hasBuiltInPrompt: t.hasBuiltInPrompt,
      });
    },
    []
  );

  // Filter models based on tool type（仅作为内部默认值来源，不再展示给用户）
  const availableModels = useMemo(() => {
    const allowList = Array.isArray(availableModelIds) && availableModelIds.length > 0;
    let filtered = allowList
      ? models.filter((m) => availableModelIds!.includes(m.id))
      : models;
    if (toolType === "image-to-video" || toolType === "reference-to-video") {
      filtered = filtered.filter((m) => m.supportImageToVideo);
    }
    return filtered;
  }, [toolType, models, availableModelIds]);

  const currentModel = useMemo(
    () => availableModels.find((m) => m.id === selectedModel) || availableModels[0],
    [selectedModel, availableModels]
  );
  const hasAvailableModels = availableModels.length > 0;

  // 宽高比/时长选项：模板生效时以模板为准，否则回退到内部默认模型配置
  const aspectRatioOptions = template?.aspectRatio
    ? [template.aspectRatio]
    : currentModel?.aspectRatios ?? [];
  const durationOptions = template?.maxDuration
    ? [template.maxDuration]
    : currentModel?.durations ?? [];

  useEffect(() => {
    if (template) {
      if (template.aspectRatio) setAspectRatio(template.aspectRatio);
      if (template.maxDuration) setDuration(template.maxDuration);
      return;
    }
    if (!currentModel) return;

    if (currentModel.durations && !currentModel.durations.includes(duration)) {
      setDuration(currentModel.durations[0] || duration);
    }

    if (currentModel.aspectRatios && !currentModel.aspectRatios.includes(aspectRatio)) {
      setAspectRatio(currentModel.aspectRatios[0] || aspectRatio);
    }

    if (currentModel.qualities) {
      if (!currentModel.qualities.includes(quality)) {
        setQuality(currentModel.qualities[0] || quality);
      }
    }
  }, [template, currentModel, duration, aspectRatio, quality]);

  useEffect(() => {
    if (!availableModels.length) return;
    if (selectedModel && availableModels.some((m) => m.id === selectedModel)) {
      return;
    }
    const fallback = defaultModelId && availableModels.some((m) => m.id === defaultModelId)
      ? defaultModelId
      : availableModels[0]?.id;
    if (fallback) {
      setSelectedModel(fallback);
    }
  }, [availableModels, selectedModel, defaultModelId]);

  useEffect(() => {
    if (initialPrompt && !prompt) {
      setPrompt(initialPrompt);
    }
    if (initialImageUrl && !imageFile && !imageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialPrompt, initialImageUrl, prompt, imageFile, imageUrl]);

  useEffect(() => {
    if (!currentModel || template) return;
    if (initialDuration && currentModel.durations?.includes(initialDuration)) {
      setDuration(initialDuration);
    }
    if (initialAspectRatio && currentModel.aspectRatios?.includes(initialAspectRatio)) {
      setAspectRatio(initialAspectRatio);
    }
    if (initialQuality && currentModel.qualities?.includes(initialQuality)) {
      setQuality(initialQuality);
    }
  }, [currentModel, template, initialDuration, initialAspectRatio, initialQuality]);

  const estimatedCredits = useMemo(() => {
    if (template?.credits) return template.credits;
    if (!selectedModel) return 0;
    return calculateModelCredits(selectedModel, {
      duration,
      quality: currentModel?.qualities?.includes(quality) ? quality : undefined,
    });
  }, [selectedModel, duration, quality, currentModel, template]);

  const handleSubmit = useCallback(() => {
    if (!template) return; // 前台仅支持模板生成
    if (!currentModel) return;
    const promptIsHidden = Boolean(template.hasBuiltInPrompt);
    const hasPrompt = prompt.trim().length > 0;
    const requiresImage = toolType !== "text-to-video";
    const hasImage = Boolean(imageFile || imageUrl);
    // prompt 内置于模板时允许空 prompt；否则必须填写
    if ((!hasPrompt && !promptIsHidden) || isLoading) return;
    if (requiresImage && !hasImage) return;

    const data: GeneratorData = {
      toolType,
      model: "comfy-wan22-nsfw",
      prompt: prompt.trim(),
      duration,
      aspectRatio,
      quality: currentModel?.qualities?.includes(quality) ? quality : undefined,
      outputNumber: 1,
      imageFile: imageFile || undefined,
      imageUrl: imageUrl || undefined,
      templateId: template.id,
      estimatedCredits,
    };

    onSubmit?.(data);
  }, [
    prompt,
    duration,
    aspectRatio,
    quality,
    imageFile,
    imageUrl,
    estimatedCredits,
    isLoading,
    toolType,
    onSubmit,
    template,
    currentModel,
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  const canSubmit = hasAvailableModels &&
    Boolean(currentModel) &&
    template !== null &&
    (prompt.trim().length > 0 || Boolean(template.hasBuiltInPrompt)) &&
    (!((toolType !== "text-to-video") && !imageFile && !imageUrl)) &&
    !isLoading;

  // Get page title
  const getPageTitle = () => {
    if (toolType === "image-to-video") return "IMAGE TO VIDEO";
    if (toolType === "text-to-video") return "TEXT TO VIDEO";
    if (toolType === "reference-to-video") return "REFERENCE TO VIDEO";
    return "AI GENERATOR";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Card - Pollo.ai Style */}
      <div className="flex-1 flex flex-col rounded-xl bg-card border border-border overflow-hidden text-foreground">
        {/* Header Bar */}
        <div className="px-5 py-3 bg-muted/40 border-b border-border shrink-0">
          <h2 className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {getPageTitle()}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {!hasAvailableModels && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No templates are currently available for this tool.
            </div>
          )}

          {hasAvailableModels && (
            <>
          {/* Template Selection — 前台只展示模板，不暴露模型选择 */}
          <div>
            <SectionLabel required>TEMPLATE</SectionLabel>
            {template ? (
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="relative aspect-[9/16] max-h-[280px] w-full bg-muted">
                  {template.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={template.coverUrl}
                      alt={template.name || template.id}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {template.maxDuration != null && (
                      <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                        {template.maxDuration}s
                      </span>
                    )}
                    {template.aspectRatio && (
                      <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                        {template.aspectRatio}
                      </span>
                    )}
                  </div>
                  {template.credits != null && (
                    <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      {template.credits} credits
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {template.name || template.id}
                    </div>
                    {template.hasBuiltInPrompt && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Built-in prompt included
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTemplate(null)}
                    disabled={isLoading}
                    className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {tplList.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {tplList.slice(0, 9).map((t) => (
                      <button
                        key={t.templateKey}
                        type="button"
                        disabled={isLoading}
                        onClick={() => pickTemplate(t)}
                        className="group relative rounded-lg overflow-hidden border border-border bg-muted/40 hover:border-primary/60 transition-colors text-left disabled:opacity-50"
                        title={t.name}
                      >
                        <div className="relative aspect-[9/16] max-h-28 w-full bg-muted">
                          {t.coverUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.coverUrl}
                              alt={t.name}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          )}
                          <span className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                            {t.creditsCost}
                          </span>
                        </div>
                        <div className="truncate px-1.5 py-1 text-[11px] font-medium text-foreground">
                          {t.name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-11 rounded-lg border border-dashed border-border bg-muted/20 text-xs text-muted-foreground">
                    Loading templates…
                  </div>
                )}
                <Link
                  href={templatesHref || "/templates"}
                  onClick={(e) => {
                    if (isLoading) e.preventDefault();
                  }}
                  className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Browse all templates →
                </Link>
              </div>
            )}
          </div>

          {/* Prompt Section — 仅当选中的模板未内置提示词时显示（极简模式：用户只传图） */}
          {template !== null && !template?.hasBuiltInPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel className="mb-0">PROMPT</SectionLabel>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create, e.g., A cat playing in a sunny garden with natural lighting and fresh atmosphere..."
                disabled={isLoading}
                className="w-full min-h-[100px] max-h-[200px] px-4 py-3 rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none focus:border-primary transition-colors text-sm leading-relaxed"
                rows={4}
                maxLength={2000}
              />
            </div>
          )}

          {/* Image Upload (for image-to-video) */}
          {(toolType === "image-to-video" || toolType === "reference-to-video") &&
            currentModel?.supportImageToVideo && (
              <div>
                <SectionLabel required={toolType === "image-to-video"}>
                  {toolType === "reference-to-video" ? "REFERENCE IMAGE" : "IMAGE SOURCE"}
                </SectionLabel>
                {imageFile || imageUrl ? (
                  <div className="relative group h-32 rounded-lg overflow-hidden border-2 border-zinc-700">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-3">
                        <span className="text-xs font-medium truncate bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                          {imageFile?.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-muted/80 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted/60 group-hover:bg-muted transition-colors">
                      <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Upload image</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WEBP • Max 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            )}


            </>
          )}
        </div>

        {/* Bottom Section - Credits + Generate Button */}
        <div className="px-5 py-4 bg-muted/40 border-t border-border space-y-4 shrink-0">
          {/* Credits Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Credits:</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span className="text-foreground font-medium">{estimatedCredits} Credits</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              canSubmit
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>

          {!template && (
            <p className="text-xs text-center text-muted-foreground">
              Select a template to enable generation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
