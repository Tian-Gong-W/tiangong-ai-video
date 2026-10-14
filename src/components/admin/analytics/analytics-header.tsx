"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeRange = "today" | "7d" | "30d" | "90d" | "all";

interface AnalyticsHeaderProps {
  title?: string;
  description?: string;
}

export function AnalyticsHeader({
  title = "数据分析",
  description = "查看详细的数据分析和趋势",
}: AnalyticsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = (searchParams.get("range") as TimeRange) || "30d";

  const handleRangeChange = (value: TimeRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="time-range" className="text-sm font-medium">
          时间范围:
        </label>
        <Select value={currentRange} onValueChange={handleRangeChange}>
          <SelectTrigger id="time-range" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今日</SelectItem>
            <SelectItem value="7d">最近7天</SelectItem>
            <SelectItem value="30d">最近30天</SelectItem>
            <SelectItem value="90d">最近90天</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
