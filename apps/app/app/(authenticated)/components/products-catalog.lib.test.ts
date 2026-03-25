import { describe, expect, test } from "vitest";
import {
  buildCatalogMetrics,
  buildProductCatalog,
} from "./products-catalog.lib";
import type {
  ProductLinkRow,
  ProductVariantRow,
} from "./products-catalog.types";

const baseProducts: ProductLinkRow[] = [
  {
    currency: "PYG",
    deliveryEnabled: true,
    description: "Remera de algodón premium",
    expiresAt: new Date("2026-03-28T00:00:00.000Z"),
    id: "prod-1",
    imageUrl: null,
    paymentRequired: true,
    pickupEnabled: true,
    slug: "remera-premium",
    status: "active",
    title: "Remera premium",
    unitPrice: 129000,
    updatedAt: new Date("2026-03-25T00:00:00.000Z"),
  },
  {
    currency: "PYG",
    deliveryEnabled: false,
    description: null,
    expiresAt: null,
    id: "prod-2",
    imageUrl: null,
    paymentRequired: false,
    pickupEnabled: true,
    slug: "termo-mate",
    status: "draft",
    title: "Termo mate",
    unitPrice: 89000,
    updatedAt: new Date("2026-03-24T00:00:00.000Z"),
  },
];

const variants: ProductVariantRow[] = [
  {
    additionalPrice: 0,
    isDefault: true,
    name: "Talle",
    productLinkId: "prod-1",
    value: "M",
  },
  {
    additionalPrice: 0,
    isDefault: false,
    name: "Talle",
    productLinkId: "prod-1",
    value: "L",
  },
];

describe("products catalog helpers", () => {
  test("builds product cards from product links and variants", () => {
    const catalog = buildProductCatalog(baseProducts, variants);

    expect(catalog).toHaveLength(2);
    expect(catalog[0]).toMatchObject({
      fulfillmentLabel: "Retiro y entrega",
      inventoryLabel: "Inventario no conectado",
      paymentLabel: "Cobro previo habilitado",
      slug: "remera-premium",
      statusLabel: "Activo",
      variantSummary: "2 variantes",
      variantValues: ["M", "L"],
    });
    expect(catalog[1].description).toContain("Link listo");
    expect(catalog[1].variantSummary).toBe("Sin variantes");
  });

  test("derives header metrics from real product state", () => {
    const catalog = buildProductCatalog(baseProducts, variants);
    const metrics = buildCatalogMetrics(
      catalog,
      new Date("2026-03-25T00:00:00.000Z")
    );

    expect(metrics).toEqual([
      expect.objectContaining({ id: "total", value: "2" }),
      expect.objectContaining({ id: "active", value: "1" }),
      expect.objectContaining({ id: "payment", value: "1" }),
      expect.objectContaining({ id: "attention", value: "1" }),
    ]);
  });
});
