"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendDataPoint {
  date: string;
  firstVideoConversionRate: number;
  firstVideoSuccessRate: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>转化率趋势</CardTitle>
        <CardDescription>
          首视频转化率和首个视频成功率的每日变化趋势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              className="text-xs"
            />
            <Tooltip
              formatter={(value, name) => {
                const formattedValue = typeof value === "number" ? `${value.toFixed(1)}%` : String(value);
                const formattedName =
                  name === "firstVideoConversionRate" ? "首视频转化率" : "首个视频成功率";
                return [formattedValue, formattedName];
              }}
              labelFormatter={(label) => `日期: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend
              formatter={(value) =>
                value === "firstVideoConversionRate" ? "首视频转化率" : "首个视频成功率"
              }
            />
            <Line
              type="monotone"
              dataKey="firstVideoConversionRate"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="firstVideoConversionRate"
            />
            <Line
              type="monotone"
              dataKey="firstVideoSuccessRate"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="firstVideoSuccessRate"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">平均首视频转化率</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.length > 0
                ? (
                    data.reduce((sum, item) => sum + item.firstVideoConversionRate, 0) / data.length
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">平均首个视频成功率</p>
            <p className="text-2xl font-bold text-green-600">
              {data.length > 0
                ? (
                    data.reduce((sum, item) => sum + item.firstVideoSuccessRate, 0) / data.length
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
