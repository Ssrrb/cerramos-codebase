export interface AppBarChartRecord {
  category: string | null;
  createdAt: string;
  productLinkId: string;
  productTitle: string;
  successful: boolean;
}

export type AppBarChartTimeRange = "30d" | "90d" | "180d" | "365d" | "all";

export interface AppBarChartDatum {
  category: string;
  checkoutPage: string;
  conversionRate: number;
  successful: number;
  total: number;
}

export const appBarChartTimeRangeOptions: Array<{
  label: string;
  value: AppBarChartTimeRange;
}> = [
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "180 dias", value: "180d" },
  { label: "12 meses", value: "365d" },
  { label: "Todo", value: "all" },
];

export const allCategoriesValue = "__all_categories__";

const rangeInDays: Record<Exclude<AppBarChartTimeRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

const uncategorizedLabel = "Sin categoria";

const normalizeCategory = (category: string | null) =>
  category?.trim() || uncategorizedLabel;

const getRangeStart = (range: AppBarChartTimeRange, now: Date) => {
  if (range === "all") {
    return null;
  }

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (rangeInDays[range] - 1));

  return start;
};

export const getAppBarChartCategories = (records: AppBarChartRecord[]) =>
  Array.from(
    new Set(records.map((record) => normalizeCategory(record.category)))
  ).sort((left, right) => left.localeCompare(right, "es"));

export const buildAppBarChartData = ({
  category,
  now = new Date(),
  range,
  records,
}: {
  category: string;
  now?: Date;
  range: AppBarChartTimeRange;
  records: AppBarChartRecord[];
}) => {
  const rangeStart = getRangeStart(range, now);
  const grouped = new Map<
    string,
    {
      category: string;
      checkoutPage: string;
      successful: number;
      total: number;
    }
  >();

  let total = 0;
  let successful = 0;

  for (const record of records) {
    const createdAt = new Date(record.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    if (rangeStart && createdAt < rangeStart) {
      continue;
    }

    const normalizedCategory = normalizeCategory(record.category);

    if (category !== allCategoriesValue && normalizedCategory !== category) {
      continue;
    }

    const current = grouped.get(record.productLinkId) ?? {
      category: normalizedCategory,
      checkoutPage: record.productTitle,
      successful: 0,
      total: 0,
    };

    current.total += 1;
    total += 1;

    if (record.successful) {
      current.successful += 1;
      successful += 1;
    }

    grouped.set(record.productLinkId, current);
  }

  const data = Array.from(grouped.values())
    .map<AppBarChartDatum>((entry) => ({
      ...entry,
      conversionRate: entry.total > 0 ? entry.successful / entry.total : 0,
    }))
    .sort((left, right) => {
      if (right.conversionRate !== left.conversionRate) {
        return right.conversionRate - left.conversionRate;
      }

      if (right.successful !== left.successful) {
        return right.successful - left.successful;
      }

      if (right.total !== left.total) {
        return right.total - left.total;
      }

      return left.checkoutPage.localeCompare(right.checkoutPage, "es");
    });

  return {
    data,
    summary: {
      conversionRate: total > 0 ? successful / total : 0,
      successful,
      total,
    },
  };
};
