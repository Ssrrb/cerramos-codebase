import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@repo/storage/product-image", () => ({
  extractProductImageObjectKey: (value: string | null, bucketName?: string) => {
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
  normalizeStoredProductImageReference: (value: string | null | undefined) => {
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
  isForeignKeyConstraintErrorMock,
  isMissingRelationErrorMock,
  isUniqueConstraintErrorMock,
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
  isForeignKeyConstraintErrorMock: vi.fn(() => false),
  isMissingRelationErrorMock: vi.fn(() => false),
  isUniqueConstraintErrorMock: vi.fn((..._args: unknown[]) => false),
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
  kind: "product.kind",
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
  billingMode: "productLink.billingMode",
  commerceId: "productLink.commerceId",
  currency: "productLink.currency",
  deliveryEnabled: "productLink.deliveryEnabled",
  description: "productLink.description",
  expiresAt: "productLink.expiresAt",
  fulfillmentMode: "productLink.fulfillmentMode",
  id: "productLink.id",
  paymentRequired: "productLink.paymentRequired",
  pickupEnabled: "productLink.pickupEnabled",
  productId: "productLink.productId",
  slug: "productLink.slug",
  status: "productLink.status",
  subscriptionCadence: "productLink.subscriptionCadence",
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
const customerAddressTable = {
  __name: "customerAddress",
  cityId: "customerAddress.cityId",
  countryId: "customerAddress.countryId",
  customerId: "customerAddress.customerId",
  id: "customerAddress.id",
  isDefault: "customerAddress.isDefault",
  label: "customerAddress.label",
  phone: "customerAddress.phone",
  postalCode: "customerAddress.postalCode",
  recipientName: "customerAddress.recipientName",
  referenceNote: "customerAddress.referenceNote",
  stateId: "customerAddress.stateId",
  streetLine1: "customerAddress.streetLine1",
  streetLine2: "customerAddress.streetLine2",
  updatedAt: "customerAddress.updatedAt",
};
const countryTable = {
  __name: "country",
  id: "country.id",
  isoCode2: "country.isoCode2",
};
const stateTable = {
  __name: "state",
  countryId: "state.countryId",
  id: "state.id",
};
const cityTable = {
  __name: "city",
  id: "city.id",
  name: "city.name",
  stateId: "city.stateId",
};
const deliveryInfoTable = {
  __name: "deliveryInfo",
  id: "deliveryInfo.id",
};
const orderTable = {
  __name: "order",
  billingMode: "order.billingMode",
  cancelledAt: "order.cancelledAt",
  fulfillmentMode: "order.fulfillmentMode",
  id: "order.id",
  orderStatus: "order.orderStatus",
  productKind: "order.productKind",
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
const paymentCustomerTable = {
  __name: "paymentCustomer",
  externalCustomerId: "paymentCustomer.externalCustomerId",
  id: "paymentCustomer.id",
  provider: "paymentCustomer.provider",
};
const subscriptionAgreementTable = {
  __name: "subscriptionAgreement",
};

vi.mock("@repo/database", () => ({
  and: andMock,
  database: {
    select: databaseSelectMock,
    transaction: databaseTransactionMock,
  },
  eq: eqMock,
  gte: gteMock,
  isForeignKeyConstraintError: isForeignKeyConstraintErrorMock,
  isMissingRelationError: isMissingRelationErrorMock,
  isUniqueConstraintError: isUniqueConstraintErrorMock,
  leftJoin: leftJoinMock,
  sql: sqlMock,
  schema: {
    city: cityTable,
    commerce: commerceTable,
    country: countryTable,
    customerAddress: customerAddressTable,
    customerProfile: customerProfileTable,
    deliveryInfo: deliveryInfoTable,
    order: orderTable,
    orderItem: orderItemTable,
    orderStatusHistory: orderStatusHistoryTable,
    paymentCustomer: paymentCustomerTable,
    paymentIntent: paymentIntentTable,
    product: productTable,
    productImage: productImageTable,
    productLink: productLinkTable,
    state: stateTable,
    subscriptionAgreement: subscriptionAgreementTable,
  },
}));

const baseRecord = {
  billingMode: "one_time" as const,
  commerceId: "commerce_1",
  commerceLogoImageUrl: "commerces/user_1/logos/logo.png",
  commerceName: "Mate Shop",
  commerceSlug: "mate-shop",
  currency: "USD",
  defaultOrderExpiryHours: 12,
  description: "Server description",
  expiresAt: null,
  fulfillmentMode: "delivery_or_pickup" as const,
  imageObjectKey: "products/commerce_1/images/mate.png",
  paymentRequired: true,
  productId: "product_1",
  productKind: "product" as const,
  productLinkId: "link_1",
  productStatus: "active" as const,
  productLinkStatus: "active" as const,
  slug: "mate-premium",
  stock: 5,
  subscriptionCadence: null,
  title: "Server title",
  trustState: "verified" as const,
  unitPrice: 145_000,
};

const buildLegacyCheckoutPayload = (
  overrides: Partial<{
    addressLine1: string;
    addressLine2: string;
    city: string;
    customerAddressId: string;
    email: string;
    mode: "delivery" | "pickup";
    notes: string;
    phone: string;
    quantity: number;
    recipientName: string;
    reference: string;
    saveAddress: boolean;
    saveAsDefault: boolean;
  }> = {}
) => ({
  addressLine1: "",
  addressLine2: "",
  city: "",
  customerAddressId: "",
  email: "buyer@example.com",
  mode: "pickup" as const,
  notes: "",
  phone: "0981000000",
  quantity: 1,
  recipientName: "Buyer Name",
  reference: "",
  saveAddress: false,
  saveAsDefault: false,
  ...overrides,
});

describe("web product links", () => {
  beforeEach(() => {
    vi.resetModules();
    andMock.mockClear();
    databaseSelectMock.mockReset();
    databaseTransactionMock.mockReset();
    eqMock.mockClear();
    gteMock.mockClear();
    isForeignKeyConstraintErrorMock.mockReset();
    isMissingRelationErrorMock.mockReset();
    isUniqueConstraintErrorMock.mockReset();
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
    isForeignKeyConstraintErrorMock.mockReturnValue(false);
    isMissingRelationErrorMock.mockReturnValue(false);
    isUniqueConstraintErrorMock.mockReturnValue(false);

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
      innerJoin: txSelectJoinMock,
      where: txSelectWhereMock,
    }));
    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "product"
              ? [{ stock: 4 }]
              : [{ id: "customer_1" }],
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
    ).toBe(
      "/api/commerce-logos?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png"
    );
    expect(
      record ? createCheckoutViewModel(record).product.availableStock : 0
    ).toBe(5);
  });

  test("treats services with zero stock as available in checkout", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        productKind: "service" as const,
        stock: 0,
      },
    ]);

    const { createCheckoutViewModel, getPublicProductLinkCheckout } =
      await import("./product-links");
    const record = await getPublicProductLinkCheckout(
      "mate-shop",
      "mate-premium"
    );

    expect(record?.stock).toBe(0);
    expect(
      record ? createCheckoutViewModel(record).product.availableStock : 0
    ).toBe(1);
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

    expect(record?.commerceLogoImageUrl).toBe(
      "https://cdn.example.com/logo.png"
    );
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
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          cityId: "city_asuncion",
          cityName: "Asunción",
          countryId: "country_py",
          stateId: "state_capital",
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
      buildLegacyCheckoutPayload({
        addressLine1: "Buyer street",
        city: "Asuncion",
        mode: "delivery",
        notes: "Leave at reception",
        quantity: 3,
        reference: "Depto 2",
      })
    );

    expect(result).toEqual({
      orderId: "order_1",
      paymentIntentId: "payment_1",
      paymentRequired: true,
      upayFormId: "payment_1",
    });

    const orderInsert = insertedValues.find(({ table }) => table === "order");
    const deliveryInsert = insertedValues.find(
      ({ table }) => table === "deliveryInfo"
    );
    const orderItemInsert = insertedValues.find(
      ({ table }) => table === "orderItem"
    );
    const paymentIntentInsert = insertedValues.find(
      ({ table }) => table === "paymentIntent"
    );

    expect(orderInsert?.values).toMatchObject({
      commerceId: "commerce_1",
      currency: "USD",
      paymentStatus: "pending",
      productLinkId: "link_1",
      quantity: 3,
      subtotal: 435_000,
      total: 435_000,
    });
    expect(deliveryInsert?.values).toMatchObject({
      cityId: "city_asuncion",
      countryId: "country_py",
      customerAddressId: null,
      referenceNote: "Depto 2",
      stateId: "state_capital",
      streetLine1: "Buyer street",
      streetLine2: null,
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
      buildLegacyCheckoutPayload({
        mode: "pickup",
        quantity: 3,
      }),
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
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          cityId: "city_asuncion",
          cityName: "Asunción",
          countryId: "country_py",
          stateId: "state_capital",
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
    await createOrderFromProductLink(
      "mate-shop",
      "mate-premium",
      buildLegacyCheckoutPayload({
      addressLine1: "Buyer street",
      city: "Asuncion",
      mode: "delivery",
      notes: "Leave at reception",
      reference: "Depto 2",
      })
    );

    const orderItemInsert = insertedValues.find(
      ({ table }) => table === "orderItem"
    );

    expect(orderItemInsert?.values).toMatchObject({
      imageObjectKey: "products/commerce_1/images/mate.png",
    });
  });

  test("uses a selected saved address as the delivery snapshot source", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([
        {
          email: "auth@example.com",
          id: "customer_auth_1",
          name: "Authenticated Buyer",
        },
      ])
      .mockResolvedValueOnce([
        {
          cityId: "city_saved",
          countryId: "country_saved",
          customerId: "customer_auth_1",
          id: "address_1",
          isDefault: false,
          label: "Casa",
          phone: "0981888999",
          postalCode: "1209",
          recipientName: "Saved Buyer",
          referenceNote: "Frente al parque",
          stateId: "state_saved",
          streetLine1: "Saved street 123",
          streetLine2: "Depto 2",
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
        cityId: "city_ignored",
        countryId: "country_ignored",
        customerAddressId: "address_1",
        email: "buyer@example.com",
        mode: "delivery",
        notes: "Leave at reception",
        phone: "0981000000",
        postalCode: "",
        quantity: 1,
        referenceNote: "",
        recipientName: "Buyer Name",
        saveAddress: false,
        saveAsDefault: false,
        stateId: "state_ignored",
        streetLine1: "Edited street",
        streetLine2: "",
      },
      {
        customerId: "customer_auth_1",
        userId: "user_1",
      }
    );

    const deliveryInsert = insertedValues.find(
      ({ table }) => table === "deliveryInfo"
    );

    expect(deliveryInsert?.values).toMatchObject({
      cityId: "city_saved",
      countryId: "country_saved",
      customerAddressId: "address_1",
      postalCode: "1209",
      referenceNote: "Frente al parque",
      stateId: "state_saved",
      streetLine1: "Saved street 123",
      streetLine2: "Depto 2",
    });
  });

  test("saves a new customer address and links it to the delivery snapshot", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        paymentRequired: false,
      },
    ]);
    txSelectWhereMock
      .mockResolvedValueOnce([{ stock: 5 }])
      .mockResolvedValueOnce([
        {
          email: "auth@example.com",
          id: "customer_auth_1",
          name: "Authenticated Buyer",
        },
      ])
      .mockResolvedValueOnce([
        {
          cityId: "city_asuncion",
          countryId: "country_py",
          stateId: "state_capital",
        },
      ])
      .mockResolvedValueOnce([{ id: "address_new" }]);

    const insertedValues: Array<{
      table: string;
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { __name: string }) => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push({ table: table.__name, values });

        switch (table.__name) {
          case "customerAddress":
            return {
              returning: async () => [
                {
                  cityId: "city_asuncion",
                  countryId: "country_py",
                  customerId: "customer_auth_1",
                  id: "address_new",
                  isDefault: true,
                  label: null,
                  phone: "0981000000",
                  postalCode: "1000",
                  recipientName: "Buyer Name",
                  referenceNote: "Portón negro",
                  stateId: "state_capital",
                  streetLine1: "Buyer street",
                  streetLine2: "Depto 2",
                },
              ],
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
    await createOrderFromProductLink(
      "mate-shop",
      "mate-premium",
      {
        cityId: "city_asuncion",
        countryId: "country_py",
        customerAddressId: "",
        email: "buyer@example.com",
        mode: "delivery",
        notes: "Leave at reception",
        phone: "0981000000",
        postalCode: "1000",
        quantity: 1,
        referenceNote: "Portón negro",
        recipientName: "Buyer Name",
        saveAddress: true,
        saveAsDefault: true,
        stateId: "state_capital",
        streetLine1: "Buyer street",
        streetLine2: "Depto 2",
      },
      {
        customerId: "customer_auth_1",
        userId: "user_1",
      }
    );

    const savedAddressInsert = insertedValues.find(
      ({ table }) => table === "customerAddress"
    );
    const deliveryInsert = insertedValues.find(
      ({ table }) => table === "deliveryInfo"
    );

    expect(savedAddressInsert?.values).toMatchObject({
      cityId: "city_asuncion",
      countryId: "country_py",
      customerId: "customer_1",
      isDefault: true,
      phone: "0981000000",
      postalCode: "1000",
      recipientName: "Buyer Name",
      referenceNote: "Portón negro",
      stateId: "state_capital",
      streetLine1: "Buyer street",
      streetLine2: "Depto 2",
    });
    expect(deliveryInsert?.values).toMatchObject({
      customerAddressId: "address_new",
    });
  });

  test("applyDefaultAddressSelection rejects foreign address without mutating defaults", async () => {
    const { _applyDefaultAddressSelection } = await import("./product-links");

    const txMock = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })),
      update: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })),
    };

    await expect(
      _applyDefaultAddressSelection(
        txMock as Parameters<typeof _applyDefaultAddressSelection>[0],
        "customer_real",
        "address_foreign"
      )
    ).rejects.toThrow("does not belong to this customer");

    expect(txMock.update).not.toHaveBeenCalled();
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
      buildLegacyCheckoutPayload()
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
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload()
      )
    ).rejects.toThrow(
      "El pago online todavia no esta disponible para este link."
    );
  });

  test("rejects fulfillment modes disabled by the link", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        fulfillmentMode: "delivery",
      },
    ]);

    const { createOrderFromProductLink } = await import("./product-links");

    await expect(
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload()
      )
    ).rejects.toThrow("Este link no permite retiro.");
  });

  test("allows service checkouts with no fulfillment step", async () => {
    selectWhereMock.mockResolvedValueOnce([
      {
        ...baseRecord,
        fulfillmentMode: "none" as const,
        paymentRequired: false,
        productKind: "service" as const,
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

    txUpdateMock.mockImplementation((table: { __name?: string }) => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            table.__name === "customerProfile"
              ? [{ id: "customer_1" }]
              : [{ stock: 2 }],
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
      buildLegacyCheckoutPayload({
        mode: "pickup",
      })
    );

    expect(result).toEqual({
      orderId: "order_1",
      paymentIntentId: null,
      paymentRequired: false,
      upayFormId: null,
    });

    const orderInsert = insertedValues.find(({ table }) => table === "order");
    const deliveryInsert = insertedValues.find(
      ({ table }) => table === "deliveryInfo"
    );

    expect(orderInsert?.values).toMatchObject({
      fulfillmentMode: "none",
      productKind: "service",
    });
    expect(deliveryInsert?.values).toMatchObject({
      cityId: null,
      countryId: null,
      stateId: null,
      streetLine1: null,
    });
    expect(insertedValues.map(({ table }) => table)).not.toContain(
      "paymentIntent"
    );
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
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload()
      )
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
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload({
          quantity: 3,
        })
      )
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
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload({
          quantity: 2,
        })
      )
    ).rejects.toThrow("Este producto se quedó sin stock.");
  });

  test("maps foreign key persistence failures to checkout domain errors", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    isForeignKeyConstraintErrorMock.mockReturnValueOnce(true);
    databaseTransactionMock.mockRejectedValueOnce({
      cause: {
        code: "23503",
      },
    });

    const { createOrderFromProductLink } = await import("./product-links");

    await expect(
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload()
      )
    ).rejects.toThrow(
      "Los datos del pedido cambiaron antes de confirmarse. Revisa la entrega y volvé a intentar."
    );
  });

  test("maps default address uniqueness failures to checkout domain errors", async () => {
    selectWhereMock.mockResolvedValueOnce([baseRecord]);
    isUniqueConstraintErrorMock.mockImplementation(
      (...args: unknown[]) =>
        args[1] === "CustomerAddress_customerId_default_key"
    );
    databaseTransactionMock.mockRejectedValueOnce({
      cause: {
        code: "23505",
        constraint: "CustomerAddress_customerId_default_key",
      },
    });

    const { createOrderFromProductLink } = await import("./product-links");

    await expect(
      createOrderFromProductLink(
        "mate-shop",
        "mate-premium",
        buildLegacyCheckoutPayload()
      )
    ).rejects.toThrow(
      "No se pudo guardar la direccion como predeterminada. Intentá de nuevo."
    );
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
