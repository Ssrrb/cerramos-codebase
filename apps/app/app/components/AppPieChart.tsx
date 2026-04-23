"use client";

import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitantes",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Otros",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const AppPieChart = () => {
  // If you don't use React compiler use useMemo hook to improve performance
  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0);

  return (
    <div>
      <h1 className="dashboard-panel-title">Visitantes</h1>
      <ChartContainer
        className="mx-auto aspect-square max-h-[250px]"
        config={chartConfig}
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
            cursor={false}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            innerRadius={60}
            nameKey="browser"
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      x={viewBox.cx}
                      y={viewBox.cy}
                    >
                      <tspan
                        className="fill-foreground font-bold text-3xl"
                        x={viewBox.cx}
                        y={viewBox.cy}
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        className="fill-muted-foreground"
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                      >
                        Visitantes
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          Crecimiento del 5,2 % este mes{" "}
          <TrendingUp className="h-4 w-4 text-[var(--dashboard-success)]" />
        </div>
        <div className="dashboard-subtle leading-none">
          Total de visitantes de los últimos 6 meses
        </div>
      </div>
    </div>
  );
};

export default AppPieChart;
