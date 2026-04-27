import { describe, expect, test } from "vitest";
import {
  type AppBarChartRecord,
  allCategoriesValue,
  buildAppBarChartData,
  getAppBarChartCategories,
} from "./app-bar-chart-data";

const records: AppBarChartRecord[] = [
  {
    category: "Bebidas",
    createdAt: "2026-04-20T10:00:00.000Z",
    productLinkId: "link-1",
    productTitle: "Mate premium",
    successful: true,
  },
  {
    category: "Bebidas",
    createdAt: "2026-04-21T10:00:00.000Z",
    productLinkId: "link-1",
    productTitle: "Mate premium",
    successful: false,
  },
  {
    category: "Bebidas",
    createdAt: "2026-04-22T10:00:00.000Z",
    productLinkId: "link-2",
    productTitle: "Cafe helado",
    successful: true,
  },
  {
    category: null,
    createdAt: "2026-01-10T10:00:00.000Z",
    productLinkId: "link-3",
    productTitle: "Combo sin categoria",
    successful: false,
  },
];

describe("app-bar-chart-data", () => {
  test("returns normalized category options", () => {
    expect(getAppBarChartCategories(records)).toEqual([
      "Bebidas",
      "Sin categoria",
    ]);
  });

  test("aggregates records by checkout page and sorts by conversion", () => {
    const result = buildAppBarChartData({
      category: allCategoriesValue,
      now: new Date("2026-04-27T12:00:00.000Z"),
      range: "90d",
      records,
    });

    expect(result.summary).toEqual({
      conversionRate: 2 / 3,
      successful: 2,
      total: 3,
    });
    expect(result.data).toEqual([
      {
        category: "Bebidas",
        checkoutPage: "Cafe helado",
        conversionRate: 1,
        successful: 1,
        total: 1,
      },
      {
        category: "Bebidas",
        checkoutPage: "Mate premium",
        conversionRate: 0.5,
        successful: 1,
        total: 2,
      },
    ]);
  });

  test("filters by range and category", () => {
    const result = buildAppBarChartData({
      category: "Bebidas",
      now: new Date("2026-04-27T12:00:00.000Z"),
      range: "30d",
      records,
    });

    expect(result.summary).toEqual({
      conversionRate: 2 / 3,
      successful: 2,
      total: 3,
    });
    expect(result.data).toHaveLength(2);
    expect(result.data.every((item) => item.category === "Bebidas")).toBe(true);
  });
});
