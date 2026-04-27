import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  insertMock,
  requireCommerceContextForRequestMock,
  schemaMock,
  selectMock,
  transactionMock,
  updateMock,
} = vi.hoisted(() => ({
  insertMock: vi.fn(),
  requireCommerceContextForRequestMock: vi.fn(),
  schemaMock: {
    customerProfile: {
      email: "customerProfile.email",
      id: "customerProfile.id",
      name: "customerProfile.name",
    },
    order: {
      commerceId: "order.commerceId",
      createdAt: "order.createdAt",
      customerId: "order.customerId",
      id: "order.id",
      orderStatus: "order.orderStatus",
      paymentStatus: "order.paymentStatus",
      productLinkId: "order.productLinkId",
      total: "order.total",
      updatedAt: "order.updatedAt",
      currency: "order.currency",
      confirmedAt: "order.confirmedAt",
    },
    orderStatusHistory: {
      id: "orderStatusHistory.id",
    },
    productLink: {
      id: "productLink.id",
      title: "productLink.title",
    },
  },
  selectMock: vi.fn(),
  transactionMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContextForRequest: requireCommerceContextForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    select: selectMock,
    transaction: transactionMock,
  },
  schema: schemaMock,
}));

describe("orders todos route", () => {
  beforeEach(() => {
    vi.resetModules();
    insertMock.mockReset();
    requireCommerceContextForRequestMock.mockReset();
    selectMock.mockReset();
    transactionMock.mockReset();
    updateMock.mockReset();
  });

  test("rejects requests without a valid date parameter", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      orgId: "commerce_1",
      user: { id: "user_1" },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/orders/todos?date=27-04-2026")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "La fecha es obligatoria.",
    });
    expect(selectMock).not.toHaveBeenCalled();
  });

  test("marks an order as completed", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      orgId: "commerce_1",
      user: { id: "user_1" },
    });

    const updateSetCalls: Record<string, unknown>[] = [];
    const insertedHistory: Record<string, unknown>[] = [];

    transactionMock.mockImplementation(async (callback) =>
      callback({
        insert: () => ({
          values: (values: Record<string, unknown>) => {
            insertedHistory.push(values);
          },
        }),
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                where: () => ({
                  limit: async () => [
                    {
                      createdAt: new Date("2026-04-27T10:00:00.000Z"),
                      currency: "PYG",
                      customerEmail: "cliente@example.com",
                      customerName: "Cliente Uno",
                      id: "order_1",
                      orderStatus: "new",
                      paymentStatus: "pending",
                      productTitle: "Vestido Mia",
                      total: 210_000,
                    },
                  ],
                }),
              }),
            }),
          }),
        }),
        update: () => ({
          set: (values: Record<string, unknown>) => {
            updateSetCalls.push(values);
            return {
              where: async () => undefined,
            };
          },
        }),
      })
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders/todos", {
        body: JSON.stringify({
          completed: true,
          orderId: "order_1",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      item: {
        checked: true,
        customerLabel: "Cliente Uno",
        id: "order_1",
        orderStatus: "confirmed",
        productTitle: "Vestido Mia",
      },
    });
    expect(updateSetCalls).toHaveLength(1);
    expect(updateSetCalls[0]).toMatchObject({
      orderStatus: "confirmed",
    });
    expect(updateSetCalls[0]?.confirmedAt).toBeInstanceOf(Date);
    expect(insertedHistory).toEqual([
      expect.objectContaining({
        changedById: "user_1",
        changedByType: "merchant_user",
        fromStatus: "new",
        orderId: "order_1",
        reason: "dashboard_mark_completed",
        toStatus: "confirmed",
      }),
    ]);
  });

  test("moves a completed order back to a pending state based on payment status", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      orgId: "commerce_1",
      user: { id: "user_1" },
    });

    const updateSetCalls: Record<string, unknown>[] = [];

    transactionMock.mockImplementation(async (callback) =>
      callback({
        insert: () => ({
          values: async () => undefined,
        }),
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                where: () => ({
                  limit: async () => [
                    {
                      createdAt: new Date("2026-04-27T11:00:00.000Z"),
                      currency: "PYG",
                      customerEmail: "cliente@example.com",
                      customerName: "Cliente Dos",
                      id: "order_2",
                      orderStatus: "confirmed",
                      paymentStatus: "paid",
                      productTitle: "Blazer Sol",
                      total: 325_000,
                    },
                  ],
                }),
              }),
            }),
          }),
        }),
        update: () => ({
          set: (values: Record<string, unknown>) => {
            updateSetCalls.push(values);
            return {
              where: async () => undefined,
            };
          },
        }),
      })
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders/todos", {
        body: JSON.stringify({
          completed: false,
          orderId: "order_2",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      item: {
        checked: false,
        id: "order_2",
        orderStatus: "paid",
      },
    });
    expect(updateSetCalls).toHaveLength(1);
    expect(updateSetCalls[0]).toMatchObject({
      confirmedAt: null,
      orderStatus: "paid",
    });
  });

  test("returns auth errors from the commerce context helper", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/orders/todos", {
        body: JSON.stringify({
          completed: true,
          orderId: "order_1",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(transactionMock).not.toHaveBeenCalled();
  });
});
