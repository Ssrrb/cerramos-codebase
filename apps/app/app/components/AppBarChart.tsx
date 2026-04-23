"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Completadas",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "Enero", total: 186, successful: 80 },
  { month: "Febrero", total: 305, successful: 200 },
  { month: "Marzo", total: 237, successful: 120 },
  { month: "Abril", total: 173, successful: 100 },
  { month: "Mayo", total: 209, successful: 130 },
  { month: "Junio", total: 214, successful: 140 },
];

const AppBarChart = () => {
  return (
    <div>
      <h1 className="dashboard-panel-title">Ventas</h1>
      <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          <Bar dataKey="successful" fill="var(--color-successful)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AppBarChart;
