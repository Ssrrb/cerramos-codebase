import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

const createOrderFromProductLinkMock = vi.fn();
const getCurrentCustomerProfileMock = vi.fn();
const getSessionMock = vi.fn();

class ProductLinkCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductLinkCheckoutError";
  }
}

vi.mock("@/lib/product-links", () => {
  const checkoutOrderPayloadSchema = z.object({
    addressLine1: z.string(),
    addressLine2: z.string(),
    city: z.string(),
    email: z.string().email(),
    mode: z.enum(["delivery", "pickup"]),
    notes: z.string(),
    phone: z.string(),
    quantity: z.number().int().min(1),
    recipientName: z.string(),
    reference: z.string(),
  });

  return {
    ProductLinkCheckoutError,
    checkoutOrderPayloadSchema,
    createOrderFromProductLink: createOrderFromProductLinkMock,
  };
});

vi.mock("@repo/auth/server", () => ({
  getCurrentCustomerProfile: getCurrentCustomerProfileMock,
  getSession: getSessionMock,
}));

describe("POST /api/buy/[commerceSlug]/[productLinkSlug]/orders", () => {
  beforeEach(() => {
    createOrderFromProductLinkMock.mockReset();
    getCurrentCustomerProfileMock.mockReset();
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue(null);
  });

  test("returns 400 for product link checkout domain errors", async () => {
    const { POST } = await import("./route");

    createOrderFromProductLinkMock.mockRejectedValueOnce(
      new ProductLinkCheckoutError("Este link no permite retiro.")
    );

    const response = await POST(
      new Request("http://localhost/api/buy/mate-shop/mate-premium/orders", {
        body: JSON.stringify({
          addressLine1: "",
          addressLine2: "",
          city: "",
          email: "buyer@example.com",
          mode: "pickup",
          notes: "",
          phone: "0981000000",
          quantity: 1,
          recipientName: "Buyer Name",
          reference: "",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          productLinkSlug: "mate-premium",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Este link no permite retiro.",
    });
  });

  test("returns 500 with a generic message for unexpected failures", async () => {
    const { POST } = await import("./route");

    createOrderFromProductLinkMock.mockRejectedValueOnce(
      new Error("database connection dropped")
    );

    const response = await POST(
      new Request("http://localhost/api/buy/mate-shop/mate-premium/orders", {
        body: JSON.stringify({
          addressLine1: "",
          addressLine2: "",
          city: "",
          email: "buyer@example.com",
          mode: "pickup",
          notes: "",
          phone: "0981000000",
          quantity: 1,
          recipientName: "Buyer Name",
          reference: "",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          productLinkSlug: "mate-premium",
        }),
      }
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo crear el pedido.",
    });
  });

  test("returns 400 with field errors for invalid quantity payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/buy/mate-shop/mate-premium/orders", {
        body: JSON.stringify({
          addressLine1: "",
          addressLine2: "",
          city: "",
          email: "buyer@example.com",
          mode: "pickup",
          notes: "",
          phone: "0981000000",
          quantity: 0,
          recipientName: "Buyer Name",
          reference: "",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          productLinkSlug: "mate-premium",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid checkout data.",
    });
  });

  test("passes the authenticated buyer customer profile to order creation", async () => {
    const { POST } = await import("./route");

    getSessionMock.mockResolvedValueOnce({
      user: {
        customerId: "customer_session",
        id: "user_1",
      },
    });
    getCurrentCustomerProfileMock.mockResolvedValueOnce({
      id: "customer_profile_1",
    });
    createOrderFromProductLinkMock.mockResolvedValueOnce({
      orderId: "order_1",
      paymentIntentId: null,
      paymentRequired: false,
      success: true,
      upayFormId: null,
    });

    const response = await POST(
      new Request("http://localhost/api/buy/mate-shop/mate-premium/orders", {
        body: JSON.stringify({
          addressLine1: "",
          addressLine2: "",
          city: "",
          email: "buyer@example.com",
          mode: "pickup",
          notes: "",
          phone: "0981000000",
          quantity: 1,
          recipientName: "Buyer Name",
          reference: "",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          productLinkSlug: "mate-premium",
        }),
      }
    );

    expect(response.status).toBe(200);
    expect(createOrderFromProductLinkMock).toHaveBeenCalledWith(
      "mate-shop",
      "mate-premium",
      expect.any(Object),
      {
        customerId: "customer_profile_1",
        userId: "user_1",
      }
    );
  });
});
