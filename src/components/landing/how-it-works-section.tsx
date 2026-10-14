"use client";

import { Type, Upload, Video, Download, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/components/ui";
import { LocaleLink } from "@/i18n/navigation";

/**
 * How It Works Section - 工作流程展示
 *
 * 设计模式: Step-by-Step with MagicCard + Connected Timeline
 * - MagicCard 鼠标跟随光效
 * - 渐变连接线 + 箭头
 * - 动画数字计数器
 */

// 步骤数据
const steps = [
  {
    step: "01",
    icon: Type,
    titleKey: "steps.prompt.title",
    descKey: "steps.prompt.description",
    gradient: { from: "#9E7AFF", to: "#C084FC" },
    stat: { value: 30, suffix: "s", labelKey: "steps.prompt.stat" },
  },
  {
    step: "02",
    icon: Upload,
    titleKey: "steps.upload.title",
    descKey: "steps.upload.description",
    gradient: { from: "#6366F1", to: "#818CF8" },
    stat: { value: 20, suffix: "+", labelKey: "steps.upload.stat" },
  },
  {
    step: "03",
    icon: Video,
    titleKey: "steps.generate.title",
    descKey: "steps.generate.description",
    gradient: { from: "#EC4899", to: "#F472B6" },
    stat: { value: 2, suffix: "min", labelKey: "steps.generate.stat" },
  },
  {
    step: "04",
    icon: Download,
    titleKey: "steps.download.title",
    descKey: "steps.download.description",
    gradient: { from: "#F59E0B", to: "#FBBF24" },
    stat: { value: 1080, suffix: "p", labelKey: "steps.download.stat" },
  },
];

export function HowItWorks() {
  const t = useTranslations("HowItWorks");

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
            {/* 徽章 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("badge")}
              </span>
            </motion.div>

            {/* 主标题 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              {t("title")}
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
                {t("subtitle")}
              </span>
            </motion.h2>

            {/* 描述 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>
          </div>
        </BlurFade>

        {/* 步骤卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <BlurFade key={step.step} delay={index * 0.1} inView>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* MagicCard 包裹 */}
                  <MagicCard
                    className="h-full rounded-2xl border border-border bg-card dark:bg-black/40 backdrop-blur-xl"
                    gradientFrom={step.gradient.from}
                    gradientTo={step.gradient.to}
                    gradientSize={200}
                    gradientOpacity={0.12}
                  >
                    <div className="relative p-6 h-full flex flex-col">
                      {/* 步骤编号 + 图标 */}
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${step.gradient.from}, ${step.gradient.to})`,
                          }}
                        >
                          {step.step}
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${step.gradient.from}20, ${step.gradient.to}20)`,
                          }}
                        >
                          <Icon className="h-6 w-6" style={{ color: step.gradient.from }} />
                        </motion.div>
                      </div>

                      {/* 标题 */}
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                        {t(step.titleKey)}
                      </h3>

                      {/* 描述 */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                        {t(step.descKey)}
                      </p>

                      {/* 统计数据 */}
                      {step.stat && (
                        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {t(step.stat.labelKey)}
                          </span>
                          <span className="text-lg font-bold tabular-nums">
                            <NumberTicker value={step.stat.value} />
                            <span className="text-muted-foreground text-sm ml-0.5">
                              {step.stat.suffix}
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

        {/* 底部 CTA */}
        <BlurFade delay={0.5} inView>
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
                {t("cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </ShimmerButton>
            </LocaleLink>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
