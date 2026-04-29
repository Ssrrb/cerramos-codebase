import { requireCommerceContextForRequest } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import type { OrderStatus } from "@repo/design-system/components/orders";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getMerchantOrderRecord, toMerchantOrder } from "@/lib/orders";

const updateOrderSchema = z.object({
  action: z.enum(["complete", "cancel"]),
  orderId: z.string().min(1),
});

const terminalStatuses: OrderStatus[] = ["confirmed", "cancelled", "expired"];

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

  const record = await getMerchantOrderRecord(
    context.commerce.id,
    result.data.orderId
  );

  if (!record) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 }
    );
  }

  if (terminalStatuses.includes(record.orderStatus)) {
    return NextResponse.json(
      { error: "No se puede actualizar el estado de este pedido." },
      { status: 409 }
    );
  }

  const now = new Date();
  const nextStatus: OrderStatus =
    result.data.action === "complete" ? "confirmed" : "cancelled";

  await database.transaction(async (tx) => {
    await tx
      .update(schema.order)
      .set({
        cancelledAt: result.data.action === "cancel" ? now : null,
        confirmedAt: result.data.action === "complete" ? now : null,
        orderStatus: nextStatus,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.order.id, result.data.orderId),
          eq(schema.order.commerceId, context.commerce.id)
        )
      );

    await tx.insert(schema.orderStatusHistory).values({
      changedById: context.user.id,
      changedByType: "merchant_user",
      fromStatus: record.orderStatus,
      orderId: record.id,
      reason:
        result.data.action === "complete"
          ? "dashboard_mark_completed"
          : "dashboard_cancelled",
      toStatus: nextStatus,
    });
  });

  return NextResponse.json({
    item: toMerchantOrder({
      ...record,
      orderStatus: nextStatus,
    }),
  });
};
