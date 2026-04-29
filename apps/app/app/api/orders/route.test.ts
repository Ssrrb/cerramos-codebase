import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  getMerchantOrderRecordMock,
  insertMock,
  requireCommerceContextForRequestMock,
  schemaMock,
  toMerchantOrderMock,
  transactionMock,
  updateMock,
} = vi.hoisted(() => ({
  getMerchantOrderRecordMock: vi.fn(),
  insertMock: vi.fn(),
  requireCommerceContextForRequestMock: vi.fn(),
  schemaMock: {
    order: {
      commerceId: "order.commerceId",
      id: "order.id",
    },
    orderStatusHistory: {
      id: "orderStatusHistory.id",
    },
  },
  toMerchantOrderMock: vi.fn((record) => ({
    id: record.id,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
  })),
  transactionMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContextForRequest: requireCommerceContextForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    transaction: transactionMock,
  },
  schema: schemaMock,
}));

vi.mock("@/lib/orders", () => ({
  getMerchantOrderRecord: getMerchantOrderRecordMock,
  toMerchantOrder: toMerchantOrderMock,
}));

const context = {
  commerce: { id: "commerce_1" },
  orgId: "commerce_1",
  user: { id: "user_1" },
};

const orderRecord = {
  id: "order_1",
  orderStatus: "paid",
  paymentStatus: "paid",
};

describe("orders route", () => {
  beforeEach(() => {
    vi.resetModules();
    getMerchantOrderRecordMock.mockReset();
    insertMock.mockReset();
    requireCommerceContextForRequestMock.mockReset();
    toMerchantOrderMock.mockClear();
    transactionMock.mockReset();
    updateMock.mockReset();

    requireCommerceContextForRequestMock.mockResolvedValue(context);
    getMerchantOrderRecordMock.mockResolvedValue(orderRecord);
    transactionMock.mockImplementation(async (callback) =>
      callback({
        insert: insertMock,
        update: updateMock,
      })
    );
    updateMock.mockReturnValue({
      set: (values: Record<string, unknown>) => ({
        where: async () => values,
      }),
    });
    insertMock.mockReturnValue({
      values: async (values: Record<string, unknown>) => values,
    });
  });

  test("marks an actionable order as completed and writes history", async () => {
    const insertedHistory: Record<string, unknown>[] = [];

    insertMock.mockReturnValue({
      values: (values: Record<string, unknown>) => {
        insertedHistory.push(values);
      },
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders", {
        body: JSON.stringify({ action: "complete", orderId: "order_1" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      item: {
        id: "order_1",
        orderStatus: "confirmed",
        paymentStatus: "paid",
      },
    });
    expect(updateMock).toHaveBeenCalledWith(schemaMock.order);
    const updateSet = updateMock.mock.results[0]?.value.set;
    expect(updateSet).toBeDefined();
    expect(toMerchantOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderStatus: "confirmed",
        paymentStatus: "paid",
      })
    );
    expect(insertMock).toHaveBeenCalledWith(schemaMock.orderStatusHistory);
    expect(insertedHistory).toEqual([
      expect.objectContaining({
        changedById: "user_1",
        changedByType: "merchant_user",
        fromStatus: "paid",
        orderId: "order_1",
        reason: "dashboard_mark_completed",
        toStatus: "confirmed",
      }),
    ]);
  });

  test("cancels an actionable order without changing payment status", async () => {
    const updateSetCalls: Record<string, unknown>[] = [];

    updateMock.mockReturnValue({
      set: (values: Record<string, unknown>) => {
        updateSetCalls.push(values);
        return { where: async () => undefined };
      },
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders", {
        body: JSON.stringify({ action: "cancel", orderId: "order_1" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(updateSetCalls).toHaveLength(1);
    expect(updateSetCalls[0]).toMatchObject({
      cancelledAt: expect.any(Date),
      confirmedAt: null,
      orderStatus: "cancelled",
    });
    expect(updateSetCalls[0]).not.toHaveProperty("paymentStatus");
    expect(toMerchantOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderStatus: "cancelled",
        paymentStatus: "paid",
      })
    );
  });

  test("returns auth errors from the commerce context helper", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders", {
        body: JSON.stringify({ action: "complete", orderId: "order_1" }),
        method: "PATCH",
      })
    );

    expect(response.status).toBe(401);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test("returns not found when the order is outside the active commerce", async () => {
    getMerchantOrderRecordMock.mockResolvedValue(null);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders", {
        body: JSON.stringify({ action: "complete", orderId: "order_1" }),
        method: "PATCH",
      })
    );

    expect(response.status).toBe(404);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test("rejects terminal order states", async () => {
    getMerchantOrderRecordMock.mockResolvedValue({
      ...orderRecord,
      orderStatus: "confirmed",
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders", {
        body: JSON.stringify({ action: "cancel", orderId: "order_1" }),
        method: "PATCH",
      })
    );

    expect(response.status).toBe(409);
    expect(transactionMock).not.toHaveBeenCalled();
  });
});
