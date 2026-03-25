import type {
  CatalogMetric,
  ProductCatalogItem,
  ProductLinkRow,
  ProductVariantRow,
} from "./products-catalog.types";

const statusLabels = {
  active: "Activo",
  draft: "Borrador",
  expired: "Vencido",
  inactive: "Inactivo",
} as const;

const getFulfillmentMode = (
  pickupEnabled: boolean,
  deliveryEnabled: boolean
): ProductCatalogItem["fulfillmentMode"] => {
  if (pickupEnabled && deliveryEnabled) {
    return "both";
  }

  if (deliveryEnabled) {
    return "delivery";
  }

  return "pickup";
};

const fulfillmentLabels: Record<ProductCatalogItem["fulfillmentMode"], string> =
  {
    both: "Retiro y entrega",
    delivery: "Solo entrega",
    pickup: "Solo retiro",
  };

const formatCurrency = (value: number, currency: string, locale = "es-PY") =>
  new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: currency === "PYG" ? 0 : 2,
    style: "currency",
  }).format(value);

const formatDate = (value: Date, locale = "es-PY") =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(value);

const formatTimestamp = (value: Date, locale = "es-PY") =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);

const buildVariantSummary = (variantValues: string[]) => {
  if (variantValues.length === 0) {
    return "Sin variantes";
  }

  if (variantValues.length === 1) {
    return `1 variante`;
  }

  return `${variantValues.length} variantes`;
};

export const isAttentionProduct = (
  product: Pick<ProductCatalogItem, "expiresAt" | "status">,
  now = new Date()
) => {
  if (product.status === "expired") {
    return true;
  }

  if (!product.expiresAt) {
    return false;
  }

  const expiresAt = new Date(product.expiresAt);
  const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7;

  return expiresAt.getTime() - now.getTime() <= sevenDaysInMs;
};

export const buildProductCatalog = (
  products: ProductLinkRow[],
  variants: ProductVariantRow[],
  locale = "es-PY"
): ProductCatalogItem[] => {
  const variantsByProductId = new Map<string, string[]>();

  for (const variant of variants) {
    const existingValues = variantsByProductId.get(variant.productLinkId) ?? [];

    if (!existingValues.includes(variant.value)) {
      existingValues.push(variant.value);
    }

    variantsByProductId.set(variant.productLinkId, existingValues);
  }

  return products.map((product) => {
    const fulfillmentMode = getFulfillmentMode(
      product.pickupEnabled,
      product.deliveryEnabled
    );
    const variantValues = variantsByProductId.get(product.id) ?? [];
    const expiresLabel =
      product.status === "expired"
        ? "Vencido"
        : product.expiresAt
          ? `Vence ${formatDate(product.expiresAt, locale)}`
          : "Sin vencimiento";

    return {
      currency: product.currency,
      description:
        product.description?.trim() ||
        "Link listo para compartir y cerrar ventas desde chat.",
      expiresAt: product.expiresAt?.toISOString() ?? null,
      expiresLabel,
      formattedPrice: formatCurrency(
        product.unitPrice,
        product.currency,
        locale
      ),
      fulfillmentLabel: fulfillmentLabels[fulfillmentMode],
      fulfillmentMode,
      id: product.id,
      imageUrl: product.imageUrl,
      inventoryLabel: "Inventario no conectado",
      paymentLabel: product.paymentRequired
        ? "Cobro previo habilitado"
        : "Cobro al confirmar",
      paymentRequired: product.paymentRequired,
      priceValue: product.unitPrice,
      slug: product.slug,
      status: product.status,
      statusLabel: statusLabels[product.status],
      title: product.title,
      updatedLabel: `Actualizado ${formatTimestamp(product.updatedAt, locale)}`,
      variantSummary: buildVariantSummary(variantValues),
      variantValues,
    };
  });
};

export const buildCatalogMetrics = (
  products: ProductCatalogItem[],
  now = new Date()
): CatalogMetric[] => {
  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;
  const paymentRequired = products.filter(
    (product) => product.paymentRequired
  ).length;
  const attention = products.filter((product) =>
    isAttentionProduct(product, now)
  ).length;

  return [
    {
      id: "total",
      label: "Total productos",
      note: "Links en catálogo y preparación",
      value: String(products.length),
    },
    {
      id: "active",
      label: "Activos",
      note: "Listos para compartir en redes",
      value: String(activeProducts),
    },
    {
      id: "payment",
      label: "Cobro requerido",
      note: "Piden pago antes de confirmar",
      value: String(paymentRequired),
    },
    {
      id: "attention",
      label: "Atención",
      note: "Vencidos o próximos a vencer",
      value: String(attention),
    },
  ];
};
