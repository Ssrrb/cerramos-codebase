import "server-only";

import { database, schema } from "@repo/database";
import type {
  CustomerTrackingItemViewModel,
  CustomerTrackingPageProps,
  CustomerTrackingRecommendation,
  CustomerTrackingSummaryItem,
} from "@repo/design-system/components/customer-ordenes";
import { desc, eq } from "drizzle-orm";

const shortDateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

const formatAmountLabel = (amount: number, currency: string) => {
  if (currency === "PYG") {
    return `Gs. ${new Intl.NumberFormat("es-PY").format(amount)}`;
  }

  return new Intl.NumberFormat("es-PY", {
    currency,
    style: "currency",
  }).format(amount);
};

const formatShortDate = (date: Date | null | undefined) =>
  date ? shortDateFormatter.format(date).replaceAll(".", "") : undefined;

const formatDateTime = (date: Date | null | undefined) =>
  date ? dateTimeFormatter.format(date).replaceAll(".", "") : undefined;

const buildReference = (prefix: "ORD" | "SUB", id: string) => {
  const normalized = id
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  return `${prefix}-${normalized || "000000"}`;
};

const getFulfillmentLabel = (
  fulfillmentMode: (typeof schema.order.$inferSelect)["fulfillmentMode"]
) => {
  switch (fulfillmentMode) {
    case "delivery":
      return "Entrega a domicilio";
    case "pickup":
      return "Retiro coordinado";
    case "delivery_or_pickup":
      return "Entrega o retiro";
    default:
      return "Sin entrega física";
  }
};

const getOrderStatusCopy = (
  orderStatus: (typeof schema.order.$inferSelect)["orderStatus"],
  paymentStatus: (typeof schema.order.$inferSelect)["paymentStatus"]
) => {
  if (
    orderStatus === "pending_payment" ||
    paymentStatus === "pending" ||
    paymentStatus === "failed" ||
    paymentStatus === "expired"
  ) {
    return {
      detail:
        "Todavía no se completó el cobro, así que el comercio puede seguir esperando una confirmación.",
      label: "Acción pendiente",
      tone: "warning" as const,
      trackingMilestone: "Revisá el pago o volvé a intentar la compra.",
    };
  }

  if (orderStatus === "confirmed") {
    return {
      detail: "El comercio confirmó tu pedido y sigue con la preparación.",
      label: "En preparación",
      tone: "info" as const,
      trackingMilestone: "Confirmado por el comercio.",
    };
  }

  if (orderStatus === "cancelled") {
    return {
      detail: "Este pedido ya no seguirá avanzando.",
      label: "Cancelado",
      tone: "neutral" as const,
      trackingMilestone: "El flujo se cerró.",
    };
  }

  if (orderStatus === "expired") {
    return {
      detail: "El tiempo disponible para completar esta compra terminó.",
      label: "Vencido",
      tone: "neutral" as const,
      trackingMilestone: "Necesitás iniciar una nueva compra.",
    };
  }

  if (orderStatus === "paid") {
    return {
      detail:
        "El pago quedó registrado y ahora falta la confirmación comercial.",
      label: "Pago registrado",
      tone: "success" as const,
      trackingMilestone: "Esperando validación del comercio.",
    };
  }

  return {
    detail: "Recibimos tu compra y todavía está en revisión inicial.",
    label: "Recibido",
    tone: "info" as const,
    trackingMilestone: "Pendiente de revisión comercial.",
  };
};

const getSubscriptionStatusCopy = (status: string) => {
  if (status === "cancelled") {
    return {
      detail: "La renovación automática quedó detenida.",
      label: "Cancelada",
      renewalStatus: "No se volverá a cobrar automáticamente.",
      tone: "neutral" as const,
    };
  }

  if (status === "pending_activation") {
    return {
      detail:
        "Todavía falta que el cobro inicial y la activación queden asentados.",
      label: "Activación pendiente",
      renewalStatus: "Esperando confirmación del alta.",
      tone: "warning" as const,
    };
  }

  if (status === "active") {
    return {
      detail:
        "La suscripción está al día y seguirá renovándose según la cadencia.",
      label: "Activa",
      renewalStatus: "Renovación automática activa.",
      tone: "success" as const,
    };
  }

  return {
    detail:
      "La suscripción sigue ligada a este historial con su último estado conocido.",
    label: "En seguimiento",
    renewalStatus: "Revisá la próxima novedad con el comercio.",
    tone: "info" as const,
  };
};

const getCadenceLabel = (
  cadence: (typeof schema.subscriptionAgreement.$inferSelect)["cadence"] | null
) => {
  if (cadence === "monthly") {
    return "Mensual";
  }

  return undefined;
};

const getNextChargeLabel = (
  activatedAt: Date | null,
  createdAt: Date,
  cadence: (typeof schema.subscriptionAgreement.$inferSelect)["cadence"] | null
) => {
  const anchor = activatedAt ?? createdAt;

  if (!anchor || cadence !== "monthly") {
    return undefined;
  }

  const nextCharge = new Date(anchor);
  nextCharge.setMonth(nextCharge.getMonth() + 1);
  return formatShortDate(nextCharge);
};

const buildSummary = (
  items: CustomerTrackingItemViewModel[]
): CustomerTrackingSummaryItem[] => [
  {
    description: "órdenes y suscripciones en tu cuenta",
    label: "Total",
    value: String(items.length),
  },
  {
    description: "todavía en seguimiento",
    label: "Activas",
    value: String(
      items.filter(
        (item) =>
          !["Cancelado", "Cancelada", "Vencido"].includes(item.status.label)
      ).length
    ),
  },
  {
    description: "pueden requerir una revisión tuya",
    label: "Atención",
    value: String(
      items.filter(
        (item) =>
          item.status.tone === "warning" || item.status.tone === "danger"
      ).length
    ),
  },
];

const buildRecommendations = (
  items: CustomerTrackingItemViewModel[]
): CustomerTrackingRecommendation[] =>
  items
    .filter(
      (
        item
      ): item is CustomerTrackingItemViewModel & {
        primaryAction: NonNullable<
          CustomerTrackingItemViewModel["primaryAction"]
        >;
      } => Boolean(item.primaryAction)
    )
    .slice(0, 3)
    .map((item) => ({
      action: item.primaryAction,
      badgeLabel: item.kind === "subscription" ? "Subscription" : "Order",
      description:
        item.kind === "subscription"
          ? "Retomá este plan desde el mismo link que originó tu alta."
          : "Volvé a entrar rápido al mismo producto si sigue vigente.",
      id: `recommendation-${item.id}`,
      priceLabel: item.amountLabel,
      title: item.title,
    }));

const buildDefaultPageProps = (
  locale: string
): Pick<CustomerTrackingPageProps, "breadcrumbItems" | "title"> => ({
  breadcrumbItems: [
    { href: `/${locale}`, label: "Inicio" },
    { label: "Cuenta" },
    { label: "Órdenes" },
  ],
  title: "Tus órdenes",
});

const buildEmptyPageData = (locale: string): CustomerTrackingPageProps => ({
  ...buildDefaultPageProps(locale),
  emptyState: {
    action: {
      href: `/${locale}`,
      label: "Explorar productos",
    },
    description:
      "Todavía no encontramos compras asociadas a tu cuenta. Cuando hagas la primera, vas a poder seguirla desde acá.",
    title: "Tu historial todavía está vacío",
  },
  items: [],
  recommendations: [],
  summary: buildSummary([]),
});

const mapOrderRowToItem = ({
  locale,
  row,
}: {
  locale: string;
  row: Awaited<ReturnType<typeof getCustomerOrdenesRows>>[number];
}): CustomerTrackingItemViewModel => {
  const buyAgainHref =
    row.productLinkStatus === "active"
      ? `/${locale}/buy/${row.commerceSlug}/${row.productLinkSlug}`
      : undefined;
  const baseTitle = row.title ?? row.productLinkTitle;
  const baseSubtitle = row.productVariantLabel ?? undefined;
  const deliveryNote =
    row.referenceNote ?? row.deliveryNote ?? row.streetLine1 ?? undefined;

  if (row.subscriptionId) {
    const status = getSubscriptionStatusCopy(
      row.subscriptionStatus ?? "pending_activation"
    );
    const nextChargeLabel = getNextChargeLabel(
      row.subscriptionActivatedAt,
      row.orderCreatedAt,
      row.subscriptionCadence
    );

    return {
      amountLabel: formatAmountLabel(row.orderTotal, row.currency),
      id: row.subscriptionId,
      kind: "subscription",
      merchantLabel: row.commerceName,
      occurredAt: row.orderCreatedAt.toISOString(),
      primaryAction: buyAgainHref
        ? {
            href: buyAgainHref,
            label: "Abrir plan",
          }
        : undefined,
      reference: buildReference("SUB", row.subscriptionId),
      secondaryActions: buyAgainHref
        ? [
            {
              href: buyAgainHref,
              label: "Volver a ver la oferta",
              variant: "ghost",
            },
          ]
        : undefined,
      status: {
        detail: status.detail,
        label: status.label,
        tone: status.tone,
      },
      subtitle: baseSubtitle,
      subscriptionDetails: {
        cadenceLabel: getCadenceLabel(row.subscriptionCadence),
        managementEligible: row.subscriptionStatus !== "cancelled",
        nextChargeLabel,
        renewalStatus: status.renewalStatus,
      },
      timeline: [
        {
          label: "Alta",
          value: formatShortDate(row.orderCreatedAt) ?? "Sin fecha",
        },
        {
          label: "Última novedad",
          value:
            formatDateTime(
              row.subscriptionCancelledAt ??
                row.subscriptionActivatedAt ??
                row.orderUpdatedAt
            ) ?? "Sin novedades",
        },
        {
          label: "Próximo cobro",
          value: nextChargeLabel ?? "Se confirmará más adelante",
        },
      ],
      title: baseTitle,
    };
  }

  const status = getOrderStatusCopy(row.orderStatus, row.paymentStatus);

  return {
    amountLabel: formatAmountLabel(row.orderTotal, row.currency),
    id: row.orderId,
    kind: "order",
    merchantLabel: row.commerceName,
    occurredAt: row.orderCreatedAt.toISOString(),
    orderDetails: {
      deliveryNote,
      fulfillmentStatus: getFulfillmentLabel(row.fulfillmentMode),
      reorderEligible: Boolean(buyAgainHref),
      trackingMilestone: status.trackingMilestone,
    },
    primaryAction: buyAgainHref
      ? {
          href: buyAgainHref,
          label: "Volver a comprar",
        }
      : undefined,
    reference: buildReference("ORD", row.orderId),
    secondaryActions: buyAgainHref
      ? [
          {
            href: buyAgainHref,
            label: "Comprar de nuevo",
            variant: "ghost",
          },
        ]
      : undefined,
    status: {
      detail: status.detail,
      label: status.label,
      tone: status.tone,
    },
    subtitle: baseSubtitle,
    timeline: [
      {
        label: "Compra",
        value: formatShortDate(row.orderCreatedAt) ?? "Sin fecha",
      },
      {
        label: "Última novedad",
        value:
          formatDateTime(
            row.orderCancelledAt ?? row.orderUpdatedAt ?? row.orderCreatedAt
          ) ?? "Sin novedades",
      },
      {
        label: "Vencimiento",
        value: formatShortDate(row.orderExpiresAt) ?? "Sin fecha",
      },
    ],
    title: baseTitle,
  };
};

const getCustomerOrdenesRows = async (customerId: string) =>
  database
    .select({
      commerceName: schema.commerce.name,
      commerceSlug: schema.commerce.slug,
      currency: schema.order.currency,
      deliveryNote: schema.deliveryInfo.notes,
      fulfillmentMode: schema.order.fulfillmentMode,
      orderCancelledAt: schema.order.cancelledAt,
      orderCreatedAt: schema.order.createdAt,
      orderExpiresAt: schema.order.expiresAt,
      orderId: schema.order.id,
      orderStatus: schema.order.orderStatus,
      orderTotal: schema.order.total,
      orderUpdatedAt: schema.order.updatedAt,
      paymentStatus: schema.order.paymentStatus,
      productLinkSlug: schema.productLink.slug,
      productLinkStatus: schema.productLink.status,
      productLinkTitle: schema.productLink.title,
      productVariantLabel: schema.orderItem.variantLabel,
      referenceNote: schema.deliveryInfo.referenceNote,
      streetLine1: schema.deliveryInfo.streetLine1,
      subscriptionActivatedAt: schema.subscriptionAgreement.activatedAt,
      subscriptionCadence: schema.subscriptionAgreement.cadence,
      subscriptionCancelledAt: schema.subscriptionAgreement.cancelledAt,
      subscriptionId: schema.subscriptionAgreement.id,
      subscriptionStatus: schema.subscriptionAgreement.status,
      title: schema.orderItem.title,
    })
    .from(schema.order)
    .innerJoin(schema.commerce, eq(schema.order.commerceId, schema.commerce.id))
    .innerJoin(
      schema.productLink,
      eq(schema.order.productLinkId, schema.productLink.id)
    )
    .leftJoin(schema.orderItem, eq(schema.orderItem.orderId, schema.order.id))
    .leftJoin(
      schema.deliveryInfo,
      eq(schema.order.deliveryInfoId, schema.deliveryInfo.id)
    )
    .leftJoin(
      schema.subscriptionAgreement,
      eq(schema.subscriptionAgreement.orderId, schema.order.id)
    )
    .where(eq(schema.order.customerId, customerId))
    .orderBy(desc(schema.order.updatedAt), desc(schema.order.createdAt));

export const getCustomerOrdenesPageData = async ({
  locale,
  userId,
}: {
  locale: string;
  userId: string;
}): Promise<CustomerTrackingPageProps> => {
  const [customerProfile] = await database
    .select({ id: schema.customerProfile.id })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.userId, userId))
    .limit(1);

  if (!customerProfile) {
    return buildEmptyPageData(locale);
  }

  const rows = await getCustomerOrdenesRows(customerProfile.id);
  const itemsMap = new Map<string, CustomerTrackingItemViewModel>();

  for (const row of rows) {
    if (itemsMap.has(row.orderId)) {
      continue;
    }
    itemsMap.set(row.orderId, mapOrderRowToItem({ locale, row }));
  }

  const items = [...itemsMap.values()];

  return {
    ...buildDefaultPageProps(locale),
    emptyState: {
      action: {
        href: `/${locale}`,
        label: "Explorar productos",
      },
      description:
        "Todavía no encontraste un pedido o una suscripción en esta cuenta. Cuando aparezcan, vas a poder seguirlos desde acá.",
      title: "Todavía no hay actividad para mostrar",
    },
    footerContent:
      "Los estados de cobro y los estados comerciales pueden avanzar por separado. Esta vista prioriza el contexto que importa para vos como comprador.",
    items,
    recommendations: buildRecommendations(items),
    recommendationsDescription:
      "Repetí una compra útil o retomá una suscripción desde el mismo origen, sin tocar acciones operativas del comercio.",
    summary: buildSummary(items),
    title: "Tus órdenes",
  };
};
