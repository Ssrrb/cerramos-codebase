import { describe, expect, test, vi } from "vitest";

const { getMerchantOrdersMock, requireCommerceContextMock } = vi.hoisted(
  () => ({
    getMerchantOrdersMock: vi.fn(),
    requireCommerceContextMock: vi.fn(),
  })
);

vi.mock("@repo/auth/server", () => ({
  requireCommerceContext: requireCommerceContextMock,
}));

vi.mock("@/lib/orders", () => ({
  getMerchantOrders: getMerchantOrdersMock,
}));

vi.mock("./orders-view", () => ({
  OrdersView: ({ orders }: { orders: unknown[] }) => (
    <pre>{JSON.stringify(orders)}</pre>
  ),
}));

describe("orders page", () => {
  test("loads commerce orders and renders the orders view", async () => {
    const orders = [
      {
        id: "order_1",
        orderStatus: "paid",
        paymentStatus: "paid",
      },
    ];

    requireCommerceContextMock.mockResolvedValue({
      commerce: { id: "commerce_1" },
    });
    getMerchantOrdersMock.mockResolvedValue(orders);

    const { default: OrdersPage } = await import("./page");
    const rendered = await OrdersPage();

    expect(getMerchantOrdersMock).toHaveBeenCalledWith("commerce_1");
    expect(JSON.stringify(rendered)).toContain("order_1");
  });
});
