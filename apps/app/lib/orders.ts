import { database, schema } from "@repo/database";
import type {
  MerchantOrder,
  OrderStatus,
  PaymentStatus,
} from "@repo/design-system/components/orders";
import { and, desc, eq } from "drizzle-orm";

export interface OrderRecord {
  additionalItemsCount?: number;
  createdAt: Date;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryEmail: string | null;
  deliveryMode: "delivery" | "none" | "pickup";
  deliveryNotes: string | null;
  deliveryPhone: string | null;
  deliveryRecipientName: string | null;
  deliveryReferenceNote: string | null;
  deliveryStreetLine1: string | null;
  expiresAt: Date;
  fulfillmentMode: "delivery" | "delivery_or_pickup" | "none" | "pickup";
  id: string;
  itemDescription: string | null;
  itemQuantity: number | null;
  itemTitle: string | null;
  itemVariantLabel: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  productLinkDescription: string | null;
  productLinkTitle: string;
  reference: string;
  total: number;
}

const dateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

const pygFormatter = new Intl.NumberFormat("es-PY", {
  maximumFractionDigits: 0,
});

const orderNumericSuffixPattern = /(?:^|_)(\d+)$/;

const compact = (values: Array<string | null | undefined>) =>
  values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

const formatOrderReference = (orderId: string) => {
  const numericSuffix = orderId.match(orderNumericSuffixPattern)?.[1];

  if (numericSuffix) {
    return `ORD-${numericSuffix}`;
  }

  return `ORD-${orderId.slice(-6).toUpperCase()}`;
};

export const formatOrderCurrency = (amount: number, currency: string) => {
  if (currency === "PYG") {
    return `Gs. ${pygFormatter.format(amount)}`;
  }

  return new Intl.NumberFormat("es-PY", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
};

export const formatOrderDate = (date: Date) =>
  dateFormatter.format(date).replace(".", "");

const getFulfillmentLabel = (record: OrderRecord) => {
  if (record.fulfillmentMode === "none" || record.deliveryMode === "none") {
    return "Sin entrega física";
  }

  if (record.deliveryMode === "pickup") {
    return "Retiro en tienda";
  }

  return "Entrega a domicilio";
};

const getProductSubtitle = (record: OrderRecord) => {
  const details = compact([
    record.itemVariantLabel,
    record.itemDescription ?? record.productLinkDescription,
    record.itemQuantity && record.itemQuantity > 1
      ? `${record.itemQuantity} unidades`
      : null,
    record.additionalItemsCount
      ? `${record.additionalItemsCount} item${
          record.additionalItemsCount === 1 ? "" : "s"
        } más`
      : null,
  ]);

  return details.length ? details.join(" · ") : undefined;
};

export const toMerchantOrder = (record: OrderRecord): MerchantOrder => {
  const customerName =
    record.customerName?.trim() ||
    record.deliveryRecipientName?.trim() ||
    "Cliente sin nombre";
  const customerContact = compact([
    record.customerEmail ?? record.deliveryEmail,
    record.customerPhone ?? record.deliveryPhone,
  ]).join(" · ");

  return {
    createdAtLabel: formatOrderDate(record.createdAt),
    customerContact: customerContact || undefined,
    customerName,
    expiresAtLabel: formatOrderDate(record.expiresAt),
    fulfillmentLabel: getFulfillmentLabel(record),
    id: record.id,
    note: record.deliveryNotes?.trim() || undefined,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    productSubtitle: getProductSubtitle(record),
    productTitle: record.itemTitle?.trim() || record.productLinkTitle,
    reference: formatOrderReference(record.reference),
    totalLabel: formatOrderCurrency(record.total, record.currency),
  };
};

const orderFields = {
  createdAt: schema.order.createdAt,
  currency: schema.order.currency,
  customerEmail: schema.customerProfile.email,
  customerName: schema.customerProfile.name,
  customerPhone: schema.customerProfile.phone,
  deliveryEmail: schema.deliveryInfo.email,
  deliveryMode: schema.deliveryInfo.mode,
  deliveryNotes: schema.deliveryInfo.notes,
  deliveryPhone: schema.deliveryInfo.phone,
  deliveryRecipientName: schema.deliveryInfo.recipientName,
  deliveryReferenceNote: schema.deliveryInfo.referenceNote,
  deliveryStreetLine1: schema.deliveryInfo.streetLine1,
  expiresAt: schema.order.expiresAt,
  fulfillmentMode: schema.order.fulfillmentMode,
  id: schema.order.id,
  itemDescription: schema.orderItem.description,
  itemQuantity: schema.orderItem.quantity,
  itemTitle: schema.orderItem.title,
  itemVariantLabel: schema.orderItem.variantLabel,
  orderStatus: schema.order.orderStatus,
  paymentStatus: schema.order.paymentStatus,
  productLinkDescription: schema.productLink.description,
  productLinkTitle: schema.productLink.title,
  reference: schema.order.id,
  total: schema.order.total,
};

const buildOrdersQuery = () =>
  database
    .select(orderFields)
    .from(schema.order)
    .innerJoin(
      schema.customerProfile,
      eq(schema.customerProfile.id, schema.order.customerId)
    )
    .innerJoin(
      schema.deliveryInfo,
      eq(schema.deliveryInfo.id, schema.order.deliveryInfoId)
    )
    .innerJoin(
      schema.productLink,
      eq(schema.productLink.id, schema.order.productLinkId)
    )
    .leftJoin(schema.orderItem, eq(schema.orderItem.orderId, schema.order.id));

export const getMerchantOrders = async (commerceId: string) => {
  const records = await buildOrdersQuery()
    .where(eq(schema.order.commerceId, commerceId))
    .orderBy(desc(schema.order.createdAt));

  return toMerchantOrders(records);
};

export const getMerchantOrderRecord = async (
  commerceId: string,
  orderId: string
) => {
  const records = await buildOrdersQuery()
    .where(
      and(eq(schema.order.commerceId, commerceId), eq(schema.order.id, orderId))
    )
    .orderBy(desc(schema.order.createdAt));
  const [record] = collectOrderRecords(records);

  return record ?? null;
};

const collectOrderRecords = (records: OrderRecord[]) => {
  const orders = new Map<string, OrderRecord>();

  for (const record of records) {
    const existing = orders.get(record.id);

    if (!existing) {
      orders.set(record.id, record);
      continue;
    }

    orders.set(record.id, {
      ...existing,
      additionalItemsCount: (existing.additionalItemsCount ?? 0) + 1,
    });
  }

  return [...orders.values()];
};

export const toMerchantOrders = (records: OrderRecord[]) =>
  collectOrderRecords(records).map(toMerchantOrder);
