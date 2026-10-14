"use client";

import { useMemo } from "react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/components/ui";

interface DurationSliderProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DurationSlider({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: DurationSliderProps) {
  const normalizedOptions = useMemo(
    () => Array.from(new Set(options)),
    [options]
  );

  const currentIndex = useMemo(() => {
    const idx = normalizedOptions.indexOf(value);
    return idx >= 0 ? idx : 0;
  }, [normalizedOptions, value]);

  const maxIndex = Math.max(0, normalizedOptions.length - 1);
  const currentValue = normalizedOptions[currentIndex] ?? normalizedOptions[0] ?? value;
  const minValue = normalizedOptions[0] ?? value;
  const maxValue = normalizedOptions[maxIndex] ?? value;

  if (normalizedOptions.length <= 1) {
    return (
      <div className={cn("rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white", className)}>
        {currentValue}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Slider
        value={[currentIndex]}
        min={0}
        max={maxIndex}
        step={1}
        onValueChange={(vals) => {
          const nextIndex = vals[0] ?? 0;
          const next = normalizedOptions[nextIndex];
          if (next) onChange(next);
        }}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{minValue}</span>
        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-white">{currentValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

export default DurationSlider;
