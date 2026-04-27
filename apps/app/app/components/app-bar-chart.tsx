"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type AppBarChartRecord,
  type AppBarChartTimeRange,
  allCategoriesValue,
  appBarChartTimeRangeOptions,
  buildAppBarChartData,
  getAppBarChartCategories,
} from "@/app/components/app-bar-chart-data";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  total: {
    label: "Leads",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Completadas",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface AppBarChartProps {
  generatedAt: string;
  records: AppBarChartRecord[];
}

const percentFormatter = new Intl.NumberFormat("es-PY", {
  maximumFractionDigits: 1,
  style: "percent",
});

const AppBarChart = ({ generatedAt, records }: AppBarChartProps) => {
  const [range, setRange] = useState<AppBarChartTimeRange>("90d");
  const [category, setCategory] = useState(allCategoriesValue);

  const categories = getAppBarChartCategories(records);
  const chartData = buildAppBarChartData({
    category,
    now: new Date(generatedAt),
    range,
    records,
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="dashboard-panel-title">Conversion por checkout</h1>
          <p className="dashboard-subtle">
            {chartData.summary.successful} de {chartData.summary.total} pedidos
            confirmados (
            {percentFormatter.format(chartData.summary.conversionRate)})
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            onValueChange={(value) => setRange(value as AppBarChartTimeRange)}
            value={range}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {appBarChartTimeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allCategoriesValue}>
                Todas las categorias
              </SelectItem>
              {categories.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {chartData.data.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground text-sm">
          No hay pedidos para los filtros seleccionados.
        </div>
      ) : (
        <ChartContainer className="min-h-[240px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData.data}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="checkoutPage"
              minTickGap={24}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.slice(0, 12)}...` : value
              }
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            <Bar
              dataKey="successful"
              fill="var(--color-successful)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default AppBarChart;
