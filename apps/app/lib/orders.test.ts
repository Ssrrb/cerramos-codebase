import { describe, expect, test, vi } from "vitest";

vi.mock("@repo/database", () => ({
  database: {
    select: vi.fn(),
  },
  schema: {
    customerProfile: {
      email: "customerProfile.email",
      id: "customerProfile.id",
      name: "customerProfile.name",
      phone: "customerProfile.phone",
    },
    deliveryInfo: {
      email: "deliveryInfo.email",
      id: "deliveryInfo.id",
      mode: "deliveryInfo.mode",
      notes: "deliveryInfo.notes",
      phone: "deliveryInfo.phone",
      recipientName: "deliveryInfo.recipientName",
      referenceNote: "deliveryInfo.referenceNote",
      streetLine1: "deliveryInfo.streetLine1",
    },
    order: {
      commerceId: "order.commerceId",
      createdAt: "order.createdAt",
      customerId: "order.customerId",
      deliveryInfoId: "order.deliveryInfoId",
      expiresAt: "order.expiresAt",
      fulfillmentMode: "order.fulfillmentMode",
      id: "order.id",
      orderStatus: "order.orderStatus",
      paymentStatus: "order.paymentStatus",
      productLinkId: "order.productLinkId",
      total: "order.total",
      currency: "order.currency",
    },
    orderItem: {
      description: "orderItem.description",
      orderId: "orderItem.orderId",
      quantity: "orderItem.quantity",
      title: "orderItem.title",
      variantLabel: "orderItem.variantLabel",
    },
    productLink: {
      description: "productLink.description",
      id: "productLink.id",
      title: "productLink.title",
    },
  },
}));

const baseRecord = {
  createdAt: new Date("2026-04-27T14:35:00.000Z"),
  currency: "PYG",
  customerEmail: "camila@cerramos.com",
  customerName: "Camila Ferreira",
  customerPhone: "0981 123 456",
  deliveryEmail: "delivery@example.com",
  deliveryMode: "delivery" as const,
  deliveryNotes: "Recibir despues de las 18:00.",
  deliveryPhone: "0991 111 222",
  deliveryRecipientName: "Camila F.",
  deliveryReferenceNote: "Porton negro",
  deliveryStreetLine1: "Av. España 123",
  expiresAt: new Date("2026-04-28T14:35:00.000Z"),
  fulfillmentMode: "delivery_or_pickup" as const,
  id: "order_2048",
  itemDescription: "Negro mate",
  itemQuantity: 1,
  itemTitle: "Set matero de acero",
  itemVariantLabel: "1 litro",
  orderStatus: "paid" as const,
  paymentStatus: "pending" as const,
  productLinkDescription: "Producto publicado",
  productLinkTitle: "Set matero",
  reference: "order_2048",
  total: 145_000,
};

describe("orders mapper", () => {
  test("maps customer identity, contact and PYG currency", async () => {
    const { toMerchantOrder } = await import("./orders");

    const order = toMerchantOrder(baseRecord);

    expect(order).toMatchObject({
      customerContact: "camila@cerramos.com · 0981 123 456",
      customerName: "Camila Ferreira",
      orderStatus: "paid",
      paymentStatus: "pending",
      productSubtitle: "1 litro · Negro mate",
      productTitle: "Set matero de acero",
      reference: "ORD-2048",
      totalLabel: "Gs. 145.000",
    });
  });

  test("falls back to delivery recipient when customer has no name", async () => {
    const { toMerchantOrder } = await import("./orders");

    const order = toMerchantOrder({
      ...baseRecord,
      customerEmail: null,
      customerName: null,
      customerPhone: null,
    });

    expect(order.customerName).toBe("Camila F.");
    expect(order.customerContact).toBe("delivery@example.com · 0991 111 222");
  });

  test("labels delivery, pickup and no-fulfillment orders", async () => {
    const { toMerchantOrder } = await import("./orders");

    expect(toMerchantOrder(baseRecord).fulfillmentLabel).toBe(
      "Entrega a domicilio"
    );
    expect(
      toMerchantOrder({
        ...baseRecord,
        deliveryMode: "pickup",
        fulfillmentMode: "pickup",
      }).fulfillmentLabel
    ).toBe("Retiro en tienda");
    expect(
      toMerchantOrder({
        ...baseRecord,
        deliveryMode: "none",
        fulfillmentMode: "none",
      }).fulfillmentLabel
    ).toBe("Sin entrega física");
  });

  test("keeps order and payment states independent", async () => {
    const { toMerchantOrder } = await import("./orders");

    const order = toMerchantOrder({
      ...baseRecord,
      orderStatus: "confirmed",
      paymentStatus: "cancelled",
    });

    expect(order.orderStatus).toBe("confirmed");
    expect(order.paymentStatus).toBe("cancelled");
  });

  test("deduplicates records from multiple order items", async () => {
    const { toMerchantOrders } = await import("./orders");

    const orders = toMerchantOrders([
      baseRecord,
      {
        ...baseRecord,
        itemDescription: "Acero inoxidable",
        itemQuantity: 2,
        itemTitle: "Bombillas extra",
        itemVariantLabel: null,
      },
    ]);

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: "order_2048",
      productSubtitle: "1 litro · Negro mate · 1 item más",
      productTitle: "Set matero de acero",
    });
  });
});
