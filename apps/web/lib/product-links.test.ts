import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@repo/storage/product-image", () => ({
  extractProductImageObjectKey: (
    value: string | null,
    bucketName?: string
  ) => {
    if (!value) {
      return "";
    }

    const trimmed = value.trim();

    if (trimmed.startsWith("/api/")) {
      const [, objectKey = ""] = trimmed.split("objectKey=");
      const decoded = decodeURIComponent(objectKey);

      if (decoded.startsWith("gs://")) {
        const prefix = bucketName ? `gs://${bucketName}/` : "gs://";
        return decoded.replace(prefix, "");
      }

      if (decoded.startsWith("https://")) {
        const match = decoded.match(/\/([^/?]+\/*products\/.*)$/);
        return match ? match[1].replace(/^[^/]+\//, "") : decoded;
      }

      return decoded;
    }

    if (trimmed.startsWith("gs://")) {
      const prefix = bucketName ? `gs://${bucketName}/` : "gs://";
      return trimmed.replace(prefix, "");
    }

    if (trimmed.startsWith("https://storage.googleapis.com/")) {
      const prefix = bucketName
        ? `https://storage.googleapis.com/${bucketName}/`
        : "https://storage.googleapis.com/";
      return trimmed.split("?")[0]?.replace(prefix, "") ?? trimmed;
    }

    return trimmed;
  },
  normalizeStoredProductImageReference: (
    value: string | null | undefined
  ) => {
    const normalized = value?.trim() ?? "";

    if (!normalized.startsWith("/api/")) {
      return normalized;
    }

    const [, objectKey = ""] = normalized.split("objectKey=");
    return decodeURIComponent(objectKey);
  },
}));

vi.mock("@/lib/commerce", () => ({
  normalizeCheckoutCommerceLogoUrl: (value: string | null) => {
    if (!value) {
      return null;
    }

    if (value.startsWith("http")) {
      return value;
    }

    return `/api/commerce-logos?objectKey=${encodeURIComponent(value)}`;
  },
}));

const {
  andMock,
  databaseSelectMock,
  databaseTransactionMock,
  eqMock,
  gteMock,
  isMissingRelationErrorMock,
  leftJoinMock,
  selectFromMock,
  selectJoinMock,
  selectWhereMock,
  txInsertMock,
  txSelectFromMock,
  txSelectJoinMock,
  txSelectMock,
  txSelectWhereMock,
  txUpdateMock,
  sqlMock,
} = vi.hoisted(() => ({
  andMock: vi.fn((...args: unknown[]) => ({ args, type: "and" })),
  databaseSelectMock: vi.fn(),
  databaseTransactionMock: vi.fn(),
  eqMock: vi.fn((left: unknown, right: unknown) => ({
    left,
    right,
    type: "eq",
  })),
  gteMock: vi.fn((left: unknown, right: unknown) => ({
    left,
    right,
    type: "gte",
  })),
  isMissingRelationErrorMock: vi.fn(() => false),
  leftJoinMock: vi.fn(),
  selectFromMock: vi.fn(),
  selectJoinMock: vi.fn(),
  selectWhereMock: vi.fn(),
  sqlMock: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    type: "sql",
    values,
  })),
  txInsertMock: vi.fn(),
  txSelectFromMock: vi.fn(),
  txSelectJoinMock: vi.fn(),
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
  __name: "product",
  id: "product.id",
  primaryImageId: "product.primaryImageId",
  stock: "product.stock",
  status: "product.status",
  updatedAt: "product.updatedAt",
};
const productImageTable = {
  id: "productImage.id",
  objectKey: "productImage.objectKey",
  productId: "productImage.productId",
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
const customerProfileTable = {
  __name: "customerProfile",
  email: "customerProfile.email",
  id: "customerProfile.id",
  name: "customerProfile.name",
  userId: "customerProfile.userId",
};
const deliveryInfoTable = {
  __name: "deliveryInfo",
  id: "deliveryInfo.id",
};
const orderTable = {
  __name: "order",
  cancelledAt: "order.cancelledAt",
  id: "order.id",
  orderStatus: "order.orderStatus",
  quantity: "order.quantity",
  updatedAt: "order.updatedAt",
};
const orderItemTable = {
  __name: "orderItem",
  orderId: "orderItem.orderId",
  productId: "orderItem.productId",
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
  gte: gteMock,
  isMissingRelationError: isMissingRelationErrorMock,
  leftJoin: leftJoinMock,
  sql: sqlMock,
  schema: {
    commerce: commerceTable,
    customerProfile: customerProfileTable,
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
  stock: 5,
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
    gteMock.mockClear();
    isMissingRelationErrorMock.mockReset();
    leftJoinMock.mockReset();
    selectFromMock.mockReset();
    selectJoinMock.mockReset();
    selectWhereMock.mockReset();
    txInsertMock.mockReset();
    txSelectFromMock.mockReset();
    txSelectJoinMock.mockReset();
    txSelectMock.mockReset();
    txSelectWhereMock.mockReset();
    txUpdateMock.mockReset();
    sqlMock.mockClear();
    isMissingRelationErrorMock.mockReturnValue(false);

    databaseSelectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      leftJoin: leftJoinMock,
      where: selectWhereMock,
    }));
    selectJoinMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      leftJoin: leftJoinMock,
      where: selectWhereMock,
    }));
    leftJoinMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      leftJoin: leftJoinMock,
      where: selectWhereMock,
    }));
    txSelectMock.mockImplementation(() => ({
      from: txSelectFromMock,
    }));
    txSelectFromMock.mockImplementation(() => ({
      innerJoin: txSelectJoinMock,
      where: txSelectWhereMock,
    }));
    txSelectJoinMock.mockImplementation(() => ({
      where: txSelectWhereMock,
    }));
    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "product" ? [{ stock: 4 }] : [{ id: "customer_1" }],
        }),
      }),
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
    expect(record ? createCheckoutViewModel(record).product.availableStock : 0).toBe(
      5
    );
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

  test("returns checkout data when the primary image row is missing", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey: null,
      },
    ]);

    const { getPublicProductLinkCheckout } = await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record).toMatchObject({
      commerceId: "commerce_1",
      imageReference: null,
      imageUrl: null,
      productId: "product_1",
      productLinkId: "link_1",
    });
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
      leftJoin: leftJoinMock,
      where: selectWhereMock,
    }));
    selectJoinMock.mockImplementation(() => ({
      innerJoin: selectJoinMock,
      leftJoin: leftJoinMock,
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
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
          case "customerProfile":
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

    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => {
        return {
          where: () => ({
            returning: async () =>
              table.__name === "customerProfile"
                ? [{ id: "customer_1" }]
                : [{ stock: 2 }],
          }),
        };
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
        addressLine1: "Buyer street",
        addressLine2: "",
        city: "Asuncion",
        email: "buyer@example.com",
        mode: "delivery",
        notes: "Leave at reception",
        phone: "0981000000",
        quantity: 3,
        recipientName: "Buyer Name",
        reference: "Depto 2",
      }
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
      quantity: 3,
      subtotal: 435_000,
      total: 435_000,
    });
    expect(orderItemInsert?.values).toMatchObject({
      description: "Server description",
      imageObjectKey: "products/commerce_1/images/mate.png",
      productId: "product_1",
      productLinkId: "link_1",
      quantity: 3,
      title: "Server title",
      totalPrice: 435_000,
      unitPrice: 145_000,
      variantLabel: null,
    });
    expect(paymentIntentInsert?.values).toMatchObject({
      amount: 435_000,
      currency: "USD",
      orderId: "order_1",
      provider: "pagopar_upay",
      status: "pending",
    });
  });

  test("uses the authenticated buyer customer profile when available", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([
        {
          email: "auth@example.com",
          id: "customer_auth_1",
          name: "Authenticated Buyer",
        },
      ]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
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

    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "product"
              ? [{ stock: 2 }]
              : [{ id: "customer_auth_1" }],
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
    await createOrderFromProductLink(
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
        quantity: 3,
        recipientName: "Buyer Name",
        reference: "",
      },
      {
        customerId: "customer_auth_1",
        userId: "user_1",
      }
    );

    const deliveryInsert = insertedValues.find(
      ({ table }) => table === "deliveryInfo"
    );
    const orderInsert = insertedValues.find(({ table }) => table === "order");

    expect(deliveryInsert?.values).toMatchObject({
      customerId: "customer_auth_1",
      email: "buyer@example.com",
    });
    expect(orderInsert?.values).toMatchObject({
      customerId: "customer_auth_1",
    });
    expect(txSelectWhereMock).toHaveBeenCalledTimes(2);
  });

  test("stores canonical object keys in order snapshots when the checkout source is a legacy route URL", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        imageObjectKey:
          "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
      },
    ]);
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
          case "customerProfile":
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
      quantity: 1,
      recipientName: "Buyer Name",
      reference: "Depto 2",
    });

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
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([]);

    const insertedTables: string[] = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: () => {
        insertedTables.push(table.__name);

        switch (table.__name) {
          case "customerProfile":
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

    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "customerProfile"
              ? [{ id: "customer_1" }]
              : [{ stock: 4 }],
        }),
      }),
    }));

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
        quantity: 1,
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
        quantity: 1,
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
        quantity: 1,
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow("Este link no permite retiro.");
  });

  test("rejects checkout when the product has no stock left", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        stock: 0,
      },
    ]);
    txSelectWhereMock.mockResolvedValueOnce([{ stock: 0 }]);

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

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
        quantity: 1,
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow("Este producto se quedó sin stock.");
  });

  test("rejects checkout when the requested quantity exceeds stock", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    txSelectWhereMock.mockResolvedValueOnce([{ stock: 2 }]);

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

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
        quantity: 3,
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow("La cantidad seleccionada supera el stock disponible.");
  });

  test("rejects checkout when concurrent stock reservation exhausts inventory", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 2 }])
      .mockResolvedValueOnce([{ stock: 0 }]);

    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "product" ? [] : [{ id: "customer_1" }],
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

    await expect(
      createOrderFromProductLink("mate-shop", "mate-premium", {
        addressLine1: "",
        addressLine2: "",
        city: "",
        email: "buyer@example.com",
        mode: "pickup",
        notes: "",
        phone: "0981000000",
        quantity: 2,
        recipientName: "Buyer Name",
        reference: "",
      })
    ).rejects.toThrow("Este producto se quedó sin stock.");
  });

  test("releases reserved stock when an order is cancelled", async () => {
    txSelectWhereMock.mockResolvedValueOnce([
      {
        orderId: "order_1",
        orderStatus: "pending_payment",
        productId: "product_1",
        quantity: 2,
      },
    ]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });
        return Promise.resolve(undefined);
      },
    }));

    txUpdateMock.mockImplementation(() => ({
      set: () => ({
        where: () => Promise.resolve(undefined),
      }),
    }));

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { releaseReservedStockForOrder } = await import("./product-links");
    const result = await releaseReservedStockForOrder("order_1", "cancelled");

    expect(result).toEqual({
      orderId: "order_1",
      released: true,
    });
    expect(insertedValues).toContainEqual({
      table: "orderStatusHistory",
      values: expect.objectContaining({
        fromStatus: "pending_payment",
        orderId: "order_1",
        reason: "stock_released_cancelled",
        toStatus: "cancelled",
      }),
    });
  });

  test("releases reserved stock when an order expires", async () => {
    txSelectWhereMock.mockResolvedValueOnce([
      {
        orderId: "order_1",
        orderStatus: "new",
        productId: "product_1",
        quantity: 1,
      },
    ]);

    txUpdateMock.mockImplementation(() => ({
      set: () => ({
        where: () => Promise.resolve(undefined),
      }),
    }));
    txInsertMock.mockImplementation(() => ({
      values: () => Promise.resolve(undefined),
    }));

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { releaseReservedStockForOrder } = await import("./product-links");
    const result = await releaseReservedStockForOrder("order_1", "expired");

    expect(result).toEqual({
      orderId: "order_1",
      released: true,
    });
  });

  test("does not release stock twice for terminal orders", async () => {
    txSelectWhereMock.mockResolvedValueOnce([
      {
        orderId: "order_1",
        orderStatus: "cancelled",
        productId: "product_1",
        quantity: 2,
      },
    ]);

    databaseTransactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
        select: txSelectMock,
        update: txUpdateMock,
      })
    );

    const { releaseReservedStockForOrder } = await import("./product-links");
    const result = await releaseReservedStockForOrder("order_1", "cancelled");

    expect(result).toEqual({
      orderId: "order_1",
      released: false,
    });
    expect(txUpdateMock).not.toHaveBeenCalled();
    expect(txInsertMock).not.toHaveBeenCalled();
  });
});
