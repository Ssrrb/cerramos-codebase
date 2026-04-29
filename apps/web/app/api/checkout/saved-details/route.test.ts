import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

const getCurrentCustomerProfileMock = vi.fn();
const getSessionMock = vi.fn();
const saveCheckoutDetailsMock = vi.fn();

vi.mock("@repo/auth/server", () => ({
  getCurrentCustomerProfile: getCurrentCustomerProfileMock,
  getSession: getSessionMock,
}));

vi.mock("@/lib/checkout-saved-details", () => ({
  saveCheckoutDetails: saveCheckoutDetailsMock,
}));

vi.mock("@/lib/product-links", () => ({
  checkoutOrderPayloadSchema: z.object({
    cityId: z.string(),
    countryId: z.string(),
    customerAddressId: z.string().default(""),
    email: z.string().email(),
    mode: z.enum(["delivery", "pickup"]),
    notes: z.string(),
    phone: z.string(),
    postalCode: z.string(),
    quantity: z.number().int().min(1),
    referenceNote: z.string(),
    recipientName: z.string(),
    saveAddress: z.boolean().default(false),
    saveAsDefault: z.boolean().default(false),
    stateId: z.string(),
    streetLine1: z.string(),
    streetLine2: z.string(),
  }),
}));

const payload = {
  cityId: "city_db_asuncion",
  countryId: "country_db_py",
  customerAddressId: "",
  email: "buyer@example.com",
  mode: "delivery",
  notes: "",
  phone: "0981000000",
  postalCode: "",
  quantity: 1,
  referenceNote: "",
  recipientName: "Buyer Name",
  saveAddress: false,
  saveAsDefault: false,
  stateId: "state_db_asuncion",
  streetLine1: "Av. España 742",
  streetLine2: "",
};

describe("POST /api/checkout/saved-details", () => {
  beforeEach(() => {
    getCurrentCustomerProfileMock.mockReset();
    getSessionMock.mockReset();
    saveCheckoutDetailsMock.mockReset();
    getSessionMock.mockResolvedValue(null);
    getCurrentCustomerProfileMock.mockResolvedValue(null);
  });

  test("rejects guests", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/checkout/saved-details", {
        body: JSON.stringify(payload),
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    expect(saveCheckoutDetailsMock).not.toHaveBeenCalled();
  });

  test("saves checkout details for signed-in users", async () => {
    const { POST } = await import("./route");

    getSessionMock.mockResolvedValueOnce({
      user: { customerId: "customer_session", id: "user_1" },
    });
    getCurrentCustomerProfileMock.mockResolvedValueOnce({
      id: "customer_profile_1",
    });
    saveCheckoutDetailsMock.mockResolvedValueOnce({
      savedAddressId: "address_1",
    });

    const response = await POST(
      new Request("http://localhost/api/checkout/saved-details", {
        body: JSON.stringify(payload),
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(saveCheckoutDetailsMock).toHaveBeenCalledWith({
      customerId: "customer_profile_1",
      payload,
    });
    await expect(response.json()).resolves.toMatchObject({
      savedAddressId: "address_1",
      success: true,
    });
  });
});
