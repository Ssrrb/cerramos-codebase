import { requireCommerceContextForRequest } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { and, asc, eq, gte, lt, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

type OrderStatus = (typeof schema.order.$inferSelect)["orderStatus"];
type PaymentStatus = (typeof schema.order.$inferSelect)["paymentStatus"];

const updateOrderSchema = z.object({
  completed: z.boolean(),
  orderId: z.string().min(1),
});

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateParam = (value: string) => DATE_PARAM_PATTERN.test(value);

const getDateRange = (value: string) => {
  const start = new Date(`${value}T00:00:00`);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { end, start };
};

const getPendingOrderStatus = (paymentStatus: PaymentStatus): OrderStatus => {
  switch (paymentStatus) {
    case "authorized":
    case "paid":
      return "paid";
    case "pending":
      return "pending_payment";
    default:
      return "new";
  }
};

const toTodoItem = (record: {
  createdAt: Date;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  id: string;
  orderStatus: OrderStatus;
  productTitle: string;
  total: number;
}) => ({
  checked: record.orderStatus === "confirmed",
  createdAt: record.createdAt.toISOString(),
  currency: record.currency,
  customerLabel:
    record.customerName?.trim() ||
    record.customerEmail?.trim() ||
    "Cliente sin nombre",
  id: record.id,
  orderStatus: record.orderStatus,
  productTitle: record.productTitle,
  total: record.total,
});

export const GET = async (request: Request) => {
  const context = await requireCommerceContextForRequest();

  if (context instanceof NextResponse) {
    return context;
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (!(dateParam && isValidDateParam(dateParam))) {
    return NextResponse.json(
      { error: "La fecha es obligatoria." },
      { status: 400 }
    );
  }

  const dateRange = getDateRange(dateParam);

  if (!dateRange) {
    return NextResponse.json({ error: "Fecha invalida." }, { status: 400 });
  }

  const records = await database
    .select({
      createdAt: schema.order.createdAt,
      currency: schema.order.currency,
      customerEmail: schema.customerProfile.email,
      customerName: schema.customerProfile.name,
      id: schema.order.id,
      orderStatus: schema.order.orderStatus,
      productTitle: schema.productLink.title,
      total: schema.order.total,
    })
    .from(schema.order)
    .innerJoin(
      schema.customerProfile,
      eq(schema.customerProfile.id, schema.order.customerId)
    )
    .innerJoin(
      schema.productLink,
      eq(schema.productLink.id, schema.order.productLinkId)
    )
    .where(
      and(
        eq(schema.order.commerceId, context.orgId),
        gte(schema.order.createdAt, dateRange.start),
        lt(schema.order.createdAt, dateRange.end),
        ne(schema.order.orderStatus, "cancelled"),
        ne(schema.order.orderStatus, "expired")
      )
    )
    .orderBy(asc(schema.order.createdAt));

  return NextResponse.json({
    items: records.map(toTodoItem),
  });
};

export const PATCH = async (request: Request) => {
  const context = await requireCommerceContextForRequest();

  if (context instanceof NextResponse) {
    return context;
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = updateOrderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "No se pudo actualizar el pedido." },
      { status: 400 }
    );
  }

  const updatedOrder = await database.transaction(async (tx) => {
    const [existingOrder] = await tx
      .select({
        createdAt: schema.order.createdAt,
        currency: schema.order.currency,
        customerEmail: schema.customerProfile.email,
        customerName: schema.customerProfile.name,
        id: schema.order.id,
        orderStatus: schema.order.orderStatus,
        paymentStatus: schema.order.paymentStatus,
        productTitle: schema.productLink.title,
        total: schema.order.total,
      })
      .from(schema.order)
      .innerJoin(
        schema.customerProfile,
        eq(schema.customerProfile.id, schema.order.customerId)
      )
      .innerJoin(
        schema.productLink,
        eq(schema.productLink.id, schema.order.productLinkId)
      )
      .where(
        and(
          eq(schema.order.id, result.data.orderId),
          eq(schema.order.commerceId, context.orgId)
        )
      )
      .limit(1);

    if (!existingOrder) {
      return null;
    }

    if (
      existingOrder.orderStatus === "cancelled" ||
      existingOrder.orderStatus === "expired"
    ) {
      throw new Error("No se puede actualizar el estado de este pedido.");
    }

    const now = new Date();
    const nextStatus: OrderStatus = result.data.completed
      ? "confirmed"
      : getPendingOrderStatus(existingOrder.paymentStatus);

    if (nextStatus !== existingOrder.orderStatus) {
      await tx
        .update(schema.order)
        .set({
          confirmedAt: result.data.completed ? now : null,
          orderStatus: nextStatus,
          updatedAt: now,
        })
        .where(eq(schema.order.id, existingOrder.id));

      await tx.insert(schema.orderStatusHistory).values({
        changedById: context.user.id,
        changedByType: "merchant_user",
        fromStatus: existingOrder.orderStatus,
        orderId: existingOrder.id,
        reason: result.data.completed
          ? "dashboard_mark_completed"
          : "dashboard_mark_pending",
        toStatus: nextStatus,
      });
    }

    return {
      ...existingOrder,
      orderStatus: nextStatus,
    };
  });

  if (!updatedOrder) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    item: toTodoItem(updatedOrder),
  });
};
