"use client";

import { Video, Image, Layers, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { cn } from "@/components/ui";
import { LocaleLink } from "@/i18n/navigation";

/**
 * Features Section - Bento Grid 特性展示
 *
 * 设计模式: Bento Grid with MagicCard
 * - 不等宽便当网格布局
 * - MagicCard 鼠标跟随光效
 * - BorderBeam 突出主要特性
 * - NumberTicker 数据动画
 */

// 主要特性数据
const features = [
  {
    icon: Video,
    titleKey: "textToVideo.title",
    descKey: "textToVideo.description",
    stat: { value: 30, suffix: "s", labelKey: "textToVideo.stat" },
    gradient: { from: "#9E7AFF", to: "#FE8BBB" },
    featured: true,
  },
  {
    icon: Image,
    titleKey: "imageToVideo.title",
    descKey: "imageToVideo.description",
    stat: { value: 1080, suffix: "p", labelKey: "imageToVideo.stat" },
    gradient: { from: "#6366F1", to: "#8B5CF6" },
    featured: false,
  },
  {
    icon: Layers,
    titleKey: "referenceGen.title",
    descKey: "referenceGen.description",
    stat: { value: 9, suffix: "+", labelKey: "referenceGen.stat" },
    gradient: { from: "#06B6D4", to: "#22D3EE" },
    featured: false,
  },
];

// 核心优势数据
const benefits = [
  {
    icon: Zap,
    titleKey: "fast.title",
    descKey: "fast.description",
    stat: { value: 2, suffix: "min" },
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    gradient: { from: "#F59E0B", to: "#F97316" },
  },
  {
    icon: Shield,
    titleKey: "secure.title",
    descKey: "secure.description",
    stat: { value: 100, suffix: "%" },
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    gradient: { from: "#22C55E", to: "#10B981" },
  },
  {
    icon: Clock,
    titleKey: "realtime.title",
    descKey: "realtime.description",
    stat: { value: 24, suffix: "/7" },
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    gradient: { from: "#6366F1", to: "#818CF8" },
  },
];

export function FeaturesSection() {
  const t = useTranslations("Features");

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* 区域标题 */}
        <BlurFade inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              {t("title")}
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                {t("subtitle")}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>
          </div>
        </BlurFade>

        {/* Bento Grid - 主要特性 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <BlurFade
                key={feature.titleKey}
                delay={index * 0.1}
                inView
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <MagicCard
                    className="h-full rounded-2xl border border-border bg-card dark:bg-black/40 backdrop-blur-xl"
                    gradientFrom={feature.gradient.from}
                    gradientTo={feature.gradient.to}
                    gradientColor={feature.gradient.from}
                    gradientSize={250}
                    gradientOpacity={0.15}
                  >
                    <div className="relative p-6 md:p-8 h-full flex flex-col min-h-[280px]">

                      {/* 图标 */}
                      <div className="flex items-start gap-4 justify-between mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${feature.gradient.from}, ${feature.gradient.to})`,
                          }}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </motion.div>

                        {feature.featured && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                            Popular
                          </span>
                        )}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-1">
                          {t(feature.titleKey)}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed line-clamp-2">
                          {t(feature.descKey)}
                        </p>
                      </div>

                      {/* 统计数据 */}
                      {feature.stat && (
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <span className="text-sm text-muted-foreground">
                            {t(feature.stat.labelKey)}
                          </span>
                          <span className="text-2xl font-bold tabular-nums">
                            <NumberTicker value={feature.stat.value} />
                            <span className="text-muted-foreground text-base ml-0.5">
                              {feature.stat.suffix}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </MagicCard>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        {/* 核心优势 - 三列网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <BlurFade key={benefit.titleKey} delay={0.3 + index * 0.1} inView>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <MagicCard
                    className="h-full rounded-2xl border border-border bg-card dark:bg-black/40 backdrop-blur-xl"
                    gradientFrom={benefit.gradient.from}
                    gradientTo={benefit.gradient.to}
                    gradientColor={benefit.gradient.from}
                    gradientSize={180}
                    gradientOpacity={0.12}
                  >
                    <div className="p-6 h-full flex flex-col">
                      {/* 图标 + 数据 */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            benefit.bgColor
                          )}
                        >
                          <Icon className={cn("h-5 w-5", benefit.color)} />
                        </div>
                        <span className="text-2xl font-bold tabular-nums">
                          <NumberTicker value={benefit.stat.value} delay={0.3} />
                          <span className="text-sm text-muted-foreground ml-0.5">
                            {benefit.stat.suffix}
                          </span>
                        </span>
                      </div>

                      {/* 标题 */}
                      <h4 className="text-lg font-semibold mb-1.5">
                        {t(benefit.titleKey)}
                      </h4>

                      {/* 描述 */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(benefit.descKey)}
                      </p>
                    </div>
                  </MagicCard>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        {/* 底部 CTA */}
        <BlurFade delay={0.6} inView>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <LocaleLink href="/#generator">
              <ShimmerButton
                shimmerColor="#ffffff"
                shimmerSize="0.05em"
                shimmerDuration="3s"
                borderRadius="100px"
                background="oklch(from var(--primary) l c h)"
                className="px-8 py-3 text-base font-medium shadow-lg shadow-primary/25"
              >
                {t("bottomCTA.button")}
              </ShimmerButton>
            </LocaleLink>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
