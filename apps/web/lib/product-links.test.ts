import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  andMock,
  databaseSelectMock,
  databaseTransactionMock,
  eqMock,
  selectFromMock,
  selectJoinMock,
  selectWhereMock,
  txInsertMock,
  txSelectFromMock,
  txSelectMock,
  txSelectWhereMock,
  txUpdateMock,
} = vi.hoisted(() => ({
  andMock: vi.fn((...args: unknown[]) => ({ args, type: "and" })),
  databaseSelectMock: vi.fn(),
  databaseTransactionMock: vi.fn(),
  eqMock: vi.fn((left: unknown, right: unknown) => ({
    left,
    right,
    type: "eq",
  })),
  selectFromMock: vi.fn(),
  selectJoinMock: vi.fn(),
  selectWhereMock: vi.fn(),
  txInsertMock: vi.fn(),
  txSelectFromMock: vi.fn(),
  txSelectMock: vi.fn(),
  txSelectWhereMock: vi.fn(),
  txUpdateMock: vi.fn(),
}));

const commerceTable = {
  defaultOrderExpiryHours: "commerce.defaultOrderExpiryHours",
  id: "commerce.id",
  logoImageUrl: "commerce.logoImageUrl",
  name: "commerce.name",
  slug: "commerce.slug",
  trustState: "commerce.trustState",
};
const productTable = {
  id: "product.id",
  primaryImageId: "product.primaryImageId",
  status: "product.status",
};
const productImageTable = {
  id: "productImage.id",
  objectKey: "productImage.objectKey",
};
const productLinkTable = {
  commerceId: "productLink.commerceId",
  currency: "productLink.currency",
  deliveryEnabled: "productLink.deliveryEnabled",
  description: "productLink.description",
  expiresAt: "productLink.expiresAt",
  id: "productLink.id",
  paymentRequired: "productLink.paymentRequired",
  pickupEnabled: "productLink.pickupEnabled",
  productId: "productLink.productId",
  slug: "productLink.slug",
  status: "productLink.status",
  title: "productLink.title",
  unitPrice: "productLink.unitPrice",
};
const customerTable = {
  __name: "customer",
  email: "customer.email",
  id: "customer.id",
};
const deliveryInfoTable = {
  __name: "deliveryInfo",
  id: "deliveryInfo.id",
};
const orderTable = {
  __name: "order",
  id: "order.id",
};
const orderItemTable = {
  __name: "orderItem",
};
const orderStatusHistoryTable = {
  __name: "orderStatusHistory",
};
const paymentIntentTable = {
  __name: "paymentIntent",
  id: "paymentIntent.id",
};

vi.mock("@repo/database", () => ({
  and: andMock,
  database: {
    select: databaseSelectMock,
    transaction: databaseTransactionMock,
  },
  eq: eqMock,
  schema: {
    commerce: commerceTable,
    customer: customerTable,
    deliveryInfo: deliveryInfoTable,
    order: orderTable,
    orderItem: orderItemTable,
    orderStatusHistory: orderStatusHistoryTable,
    paymentIntent: paymentIntentTable,
    product: productTable,
    productImage: productImageTable,
    productLink: productLinkTable,
  },
}));

const baseRecord = {
  commerceId: "commerce_1",
  commerceLogoImageUrl: "commerces/user_1/logos/logo.png",
  commerceName: "Mate Shop",
  commerceSlug: "mate-shop",
  currency: "USD",
  defaultOrderExpiryHours: 12,
  deliveryEnabled: true,
  description: "Server description",
  expiresAt: null,
  imageObjectKey: "products/commerce_1/images/mate.png",
  paymentRequired: true,
  pickupEnabled: true,
  productId: "product_1",
  productLinkId: "link_1",
  productStatus: "active" as const,
  productLinkStatus: "active" as const,
  slug: "mate-premium",
  title: "Server title",
  trustState: "verified" as const,
  unitPrice: 145_000,
};

describe("web product links", () => {
  beforeEach(() => {
    vi.resetModules();
    andMock.mockClear();
    databaseSelectMock.mockReset();
    databaseTransactionMock.mockReset();
    eqMock.mockClear();
    selectFromMock.mockReset();
    selectJoinMock.mockReset();
    selectWhereMock.mockReset();
    txInsertMock.mockReset();
    txSelectFromMock.mockReset();
    txSelectMock.mockReset();
    txSelectWhereMock.mockReset();
    txUpdateMock.mockReset();

    databaseSelectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      where: selectWhereMock,
    }));
    selectJoinMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      where: selectWhereMock,
    }));
    txSelectMock.mockImplementation(() => ({
      from: txSelectFromMock,
    }));
    txSelectFromMock.mockImplementation(() => ({
      where: txSelectWhereMock,
    }));
  });

  test("hides inactive product links from public checkout resolution", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        productLinkStatus: "inactive" as const,
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record).toBeNull();
  });

  test("returns the commerce logo for checkout branding", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);

    const { createCheckoutViewModel, getPublicProductLinkCheckout } =
      await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.commerceLogoImageUrl).toBe(
      "/api/commerce-logos?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png"
    );
    expect(
      record ? createCheckoutViewModel(record).merchant.avatarUrl : null
    ).toBe("/api/commerce-logos?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png");
  });

  test("keeps external commerce logo URLs untouched", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        commerceLogoImageUrl: "https://cdn.example.com/logo.png",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.commerceLogoImageUrl).toBe("https://cdn.example.com/logo.png");
  });

  test("normalizes stored internal product image URLs to the public checkout image route", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey:
          "/api/products/image?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.imageUrl).toBe(
      "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png"
    );
  });

  test("ignores deprecated product link image data and uses the canonical primary image", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey: "products/commerce_1/images/current.png",
        imageUrl:
          "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fold.png",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.imageUrl).toBe(
      "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fcurrent.png"
    );
  });

  test("normalizes raw product image object keys to the public checkout image route", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey: "products/commerce_1/images/mate.png",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.imageUrl).toBe(
      "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png"
    );
  });

  test("normalizes bucket-prefixed product image URLs to the public checkout image route", async () => {
    const originalBucketName = process.env.GCS_BUCKET_NAME;
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";

    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey:
          "/api/product-link-images?objectKey=gs%3A%2F%2Fimagenes-cerramos%2Fproducts%2Fcommerce_1%2Fimages%2Fmate.png",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.imageUrl).toBe(
      "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png"
    );

    process.env.GCS_BUCKET_NAME = originalBucketName;
  });

  test("normalizes absolute storage product image URLs to the public checkout image route", async () => {
    const originalBucketName = process.env.GCS_BUCKET_NAME;
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";

    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey:
          "https://storage.googleapis.com/imagenes-cerramos/products/commerce_1/images/mate.png?X-Goog-Algorithm=GOOG4-RSA-SHA256",
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.imageUrl).toBe(
      "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png"
    );

    process.env.GCS_BUCKET_NAME = originalBucketName;
  });

  test("extracts object keys from both route URLs and raw values", async () => {
    const originalBucketName = process.env.GCS_BUCKET_NAME;
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";

    const { getPublicProductImageObjectKey } = await import("./product-links");

    expect(
      getPublicProductImageObjectKey("products/commerce_1/images/mate.png")
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      getPublicProductImageObjectKey(
        "/api/product-link-images?objectKey=gs%3A%2F%2Fimagenes-cerramos%2Fproducts%2Fcommerce_1%2Fimages%2Fmate.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      getPublicProductImageObjectKey(
        "https://storage.googleapis.com/imagenes-cerramos/products/commerce_1/images/mate.png?X-Goog-Algorithm=GOOG4-RSA-SHA256",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      getPublicProductImageObjectKey(
        "/api/product-link-images?objectKey=https%3A%2F%2Fstorage.googleapis.com%2Fimagenes-cerramos%2Fproducts%2Fcommerce_1%2Fimages%2Fmate.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");

    process.env.GCS_BUCKET_NAME = originalBucketName;
  });

  test("hides expired and inactive products from public checkout resolution", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        expiresAt: new Date("2000-01-01T00:00:00.000Z"),
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const expired = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(expired).toBeNull();

    vi.resetModules();
    selectWhereMock.mockReset();
    databaseSelectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      where: selectWhereMock,
    }));
    selectJoinMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      where: selectWhereMock,
    }));
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        productStatus: "inactive" as const,
      },
    ]);

    const freshModule = await import("./product-links");
    const inactiveProduct = await freshModule.getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(inactiveProduct).toBeNull();
  });

  test("creates an order snapshot from server-side data and a payment intent when required", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    txSelectWhereMock.mockResolvedValueOnce([]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
          case "customer":
            return {
              returning: async () => [{ id: "customer_1" }],
            };
          case "deliveryInfo":
            return {
              returning: async () => [{ id: "delivery_1" }],
            };
          case "order":
            return {
              returning: async () => [{ id: "order_1" }],
            };
          case "paymentIntent":
            return {
              returning: async () => [{ id: "payment_1" }],
            };
          default:
            return Promise.resolve(undefined);
        }
      },
    }));

    txUpdateMock.mockImplementation(() => ({
      set: () => ({
        where: () => ({
          returning: async () => [{ id: "customer_1" }],
        }),
      }),
    }));

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { createOrderFromProductLink } = await import("./product-links");
    const result = await createOrderFromProductLink(
      "mate-shop",
      "mate-premium",
      {
        addressLine1: "Buyer street",
        addressLine2: "",
        city: "Asuncion",
        email: "buyer@example.com",
        mode: "delivery",
        notes: "Leave at reception",
        phone: "0981000000",
        recipientName: "Buyer Name",
        reference: "Depto 2",
        title: "Client title",
        unitPrice: 10,
      } as never
    );

    expect(result).toEqual({
      orderId: "order_1",
      paymentIntentId: "payment_1",
      paymentRequired: true,
      upayFormId: "payment_1",
    });

    const orderInsert = insertedValues.find(({ table }) => table === "order");
    const orderItemInsert = insertedValues.find(
      ({ table }) => table === "orderItem"
    );
    const paymentIntentInsert = insertedValues.find(
      ({ table }) => table === "paymentIntent"
    );

    expect(orderInsert?.values).toMatchObject({
      commerceId: "commerce_1",
      currency: "USD",
      fulfillmentType: "delivery",
      paymentStatus: "pending",
      productLinkId: "link_1",
      subtotal: 145_000,
      total: 145_000,
    });
    expect(orderItemInsert?.values).toMatchObject({
      description: "Server description",
      imageObjectKey: "products/commerce_1/images/mate.png",
      productId: "product_1",
      productLinkId: "link_1",
      title: "Server title",
      totalPrice: 145_000,
      unitPrice: 145_000,
      variantLabel: null,
    });
    expect(paymentIntentInsert?.values).toMatchObject({
      amount: 145_000,
      currency: "USD",
      orderId: "order_1",
      provider: "pagopar_upay",
      status: "pending",
    });
  });

  test("stores canonical object keys in order snapshots when the checkout source is a legacy route URL", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey:
          "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
      },
    ]);
    txSelectWhereMock.mockResolvedValueOnce([]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
          case "customer":
            return {
              returning: async () => [{ id: "customer_1" }],
            };
          case "deliveryInfo":
            return {
              returning: async () => [{ id: "delivery_1" }],
            };
          case "order":
            return {
              returning: async () => [{ id: "order_1" }],
            };
          case "paymentIntent":
            return {
              returning: async () => [{ id: "payment_1" }],
            };
          default:
            return Promise.resolve(undefined);
        }
      },
    }));

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { createOrderFromProductLink } = await import("./product-links");
    await createOrderFromProductLink("mate-shop", "mate-premium", {
      addressLine1: "Buyer street",
      addressLine2: "",
      city: "Asuncion",
      email: "buyer@example.com",
      mode: "delivery",
      notes: "Leave at reception",
      phone: "0981000000",
      recipientName: "Buyer Name",
      reference: "Depto 2",
      title: "Client title",
      unitPrice: 10,
    } as never);

    const orderItemInsert = insertedValues.find(
      ({ table }) => table === "orderItem"
    );

    expect(orderItemInsert?.values).toMatchObject({
      imageObjectKey: "products/commerce_1/images/mate.png",
    });
  });

  test("does not create a payment intent when the link does not require payment", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        currency: "PYG",
        paymentRequired: false,
      },
    ]);
    txSelectWhereMock.mockResolvedValueOnce([]);

    const insertedTables: string[] = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: () => {
        insertedTables.push(table.__name);

        switch (table.__name) {
          case "customer":
            return {
              returning: async () => [{ id: "customer_1" }],
            };
          case "deliveryInfo":
            return {
              returning: async () => [{ id: "delivery_1" }],
            };
          case "order":
            return {
              returning: async () => [{ id: "order_1" }],
            };
          default:
            return Promise.resolve(undefined);
        }
      },
    }));

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { createOrderFromProductLink } = await import("./product-links");
    const result = await createOrderFromProductLink(
      "mate-shop",
      "mate-premium",
      {
        addressLine1: "",
        addressLine2: "",
        city: "",
        email: "buyer@example.com",
        mode: "pickup",
        notes: "",
        phone: "0981000000",
        recipientName: "Buyer Name",
        reference: "",
      }
    );

    expect(result).toEqual({
      orderId: "order_1",
      paymentIntentId: null,
      paymentRequired: false,
      upayFormId: null,
    });
    expect(insertedTables).not.toContain("paymentIntent");
  });

  test("rejects payment-required checkout for unverified commerces", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        trustState: "pending_review" as const,
      },
    ]);

    const { createOrderFromProductLink } = await import("./product-links");

    await expect(
      createOrderFromProductLink("mate-shop", "mate-premium", {
        addressLine1: "",
        addressLine2: "",
        city: "",
        email: "buyer@example.com",
        mode: "pickup",
        notes: "",
        phone: "0981000000",
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow(
      "El pago online todavia no esta disponible para este link."
    );
  });

  test("rejects fulfillment modes disabled by the link", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        pickupEnabled: false,
      },
    ]);

    const { createOrderFromProductLink } = await import("./product-links");

    await expect(
      createOrderFromProductLink("mate-shop", "mate-premium", {
        addressLine1: "",
        addressLine2: "",
        city: "",
        email: "buyer@example.com",
        mode: "pickup",
        notes: "",
        phone: "0981000000",
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow("Este link no permite retiro.");
  });
});
