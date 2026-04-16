import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createCheckoutViewModelMock,
  getPublicProductLinkCheckoutMock,
  getSessionMock,
  notFoundMock,
} = vi.hoisted(() => ({
  createCheckoutViewModelMock: vi.fn(),
  getPublicProductLinkCheckoutMock: vi.fn(),
  getSessionMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/lib/product-links", () => ({
  createCheckoutViewModel: createCheckoutViewModelMock,
  getPublicProductLinkCheckout: getPublicProductLinkCheckoutMock,
}));

vi.mock("@repo/auth/keys", () => ({
  isGoogleAuthEnabled: () => false,
}));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
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

describe("product link checkout page", () => {
  beforeEach(() => {
    vi.resetModules();
    createCheckoutViewModelMock.mockReset();
    getPublicProductLinkCheckoutMock.mockReset();
    getSessionMock.mockReset();
    notFoundMock.mockClear();
    getSessionMock.mockResolvedValue(null);
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
        name: "Buyer Name",
      },
    });
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
