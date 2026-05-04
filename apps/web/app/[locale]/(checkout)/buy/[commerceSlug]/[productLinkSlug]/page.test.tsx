import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createCheckoutViewModelMock,
  getCheckoutLocationDataMock,
  getCurrentCustomerProfileMock,
  getPublicProductLinkCheckoutMock,
  listCheckoutSavedAddressesMock,
  getSessionMock,
  notFoundMock,
  warmDatabaseConnectionMock,
} = vi.hoisted(() => ({
  createCheckoutViewModelMock: vi.fn(),
  getCheckoutLocationDataMock: vi.fn(),
  getCurrentCustomerProfileMock: vi.fn(),
  getPublicProductLinkCheckoutMock: vi.fn(),
  listCheckoutSavedAddressesMock: vi.fn(),
  getSessionMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("notFound");
  }),
  warmDatabaseConnectionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/lib/product-links", () => ({
  createCheckoutViewModel: createCheckoutViewModelMock,
  getPublicProductLinkCheckout: getPublicProductLinkCheckoutMock,
}));

vi.mock("@/lib/checkout-locations", () => ({
  getCheckoutLocationData: getCheckoutLocationDataMock,
}));

vi.mock("@/lib/checkout-customer-addresses", () => ({
  listCheckoutSavedAddresses: listCheckoutSavedAddressesMock,
}));

vi.mock("@repo/auth/keys", () => ({
  isGoogleAuthEnabled: () => false,
}));

vi.mock("@repo/auth/server", () => ({
  getCurrentCustomerProfile: getCurrentCustomerProfileMock,
  getSession: getSessionMock,
}));

vi.mock("@repo/database", () => ({
  warmDatabaseConnection: warmDatabaseConnectionMock,
}));

vi.mock("./product-link-checkout-client", () => ({
  ProductLinkCheckoutClient: (props: Record<string, unknown>) => (
    <pre>{JSON.stringify(props)}</pre>
  ),
}));

const checkoutRecord = {
  commerceId: "commerce_1",
  commerceLogoImageUrl: "https://cdn.example.com/logo.png",
  commerceName: "Mate Shop",
  commerceSlug: "mate-shop",
  currency: "PYG",
  defaultOrderExpiryHours: 24,
  deliveryEnabled: true,
  description: "Oferta principal",
  expiresAt: null,
  imageUrl: "/api/product-link-images?objectKey=products%2Fmate.png",
  paymentRequired: true,
  pickupEnabled: true,
  productId: "product_1",
  productLinkId: "link_1",
  slug: "mate-premium",
  title: "Mate premium",
  trustState: "verified" as const,
  unitPrice: 145_000,
};

const locationData = {
  cities: [
    {
      label: "Asunción",
      stateId: "state_db_asuncion",
      value: "city_db_asuncion",
    },
  ],
  countries: [
    {
      label: "Paraguay",
      value: "country_db_py",
    },
  ],
  states: [
    {
      countryId: "country_db_py",
      label: "Asunción",
      value: "state_db_asuncion",
    },
  ],
};

describe("product link checkout page", () => {
  beforeEach(() => {
    vi.resetModules();
    createCheckoutViewModelMock.mockReset();
    getCheckoutLocationDataMock.mockReset();
    getCurrentCustomerProfileMock.mockReset();
    getPublicProductLinkCheckoutMock.mockReset();
    listCheckoutSavedAddressesMock.mockReset();
    getSessionMock.mockReset();
    warmDatabaseConnectionMock.mockReset();
    notFoundMock.mockClear();
    getSessionMock.mockResolvedValue(null);
    getCurrentCustomerProfileMock.mockResolvedValue(null);
    getCheckoutLocationDataMock.mockResolvedValue(locationData);
    listCheckoutSavedAddressesMock.mockResolvedValue([]);
  });

  test("generates noindex metadata for active checkout pages", async () => {
    getPublicProductLinkCheckoutMock.mockResolvedValue(checkoutRecord);

    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({
        commerceSlug: "mate-shop",
        locale: "en",
        productLinkSlug: "mate-premium",
      }),
    });

    expect(getPublicProductLinkCheckoutMock).toHaveBeenCalledWith(
      "mate-shop",
      "mate-premium"
    );
    expect(metadata).toMatchObject({
      robots: {
        follow: false,
        index: false,
      },
      title: "Mate premium | Mate Shop",
    });
  });

  test("renders the checkout client with the resolved server data", async () => {
    getPublicProductLinkCheckoutMock.mockResolvedValue(checkoutRecord);
    getSessionMock.mockResolvedValue({
      user: {
        email: "buyer@example.com",
        id: "user_1",
        name: "Buyer Name",
      },
    });
    getCurrentCustomerProfileMock.mockResolvedValue({
      id: "customer_1",
      name: "Profile Buyer",
      phone: "0981555555",
    });
    listCheckoutSavedAddressesMock.mockResolvedValue([
      {
        cityId: "city_db_asuncion",
        countryId: "country_db_py",
        id: "address_1",
        isDefault: true,
        label: "Casa",
        phone: "0981000000",
        postalCode: "1000",
        recipientName: "Buyer Name",
        referenceNote: "Portón negro",
        stateId: "state_db_asuncion",
        streetLine1: "Av. España 742",
        streetLine2: null,
        summary: "Av. España 742, Asunción",
      },
    ]);
    createCheckoutViewModelMock.mockReturnValue({
      merchant: {
        name: "Mate Shop",
      },
      orderSummary: {
        title: "Tu pedido",
      },
      product: {
        name: "Mate premium",
      },
    });

    const { default: ProductLinkCheckoutPage } = await import("./page");
    const html = renderToStaticMarkup(
      await ProductLinkCheckoutPage({
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          locale: "en",
          productLinkSlug: "mate-premium",
        }),
      })
    );

    expect(html).toContain("mate-shop");
    expect(html).toContain("mate-premium");
    expect(html).toContain("buyer@example.com");
    expect(html).toContain("Profile Buyer");
    expect(html).toContain("0981555555");
    expect(html).toContain("country_db_py");
    expect(html).toContain("address_1");
    expect(html).toContain("paymentRequired&quot;:true");
  });

  test("returns notFound for missing checkout links", async () => {
    getPublicProductLinkCheckoutMock.mockResolvedValue(null);

    const { default: ProductLinkCheckoutPage } = await import("./page");

    await expect(
      ProductLinkCheckoutPage({
        params: Promise.resolve({
          commerceSlug: "mate-shop",
          locale: "en",
          productLinkSlug: "missing",
        }),
      })
    ).rejects.toThrow("notFound");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
