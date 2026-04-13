import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  isMissingRelationErrorMock,
  isUniqueConstraintErrorMock,
  requireCommerceIdForRequestMock,
  selectFromMock,
  selectMock,
  selectWhereMock,
  updateMock,
  updateReturningMock,
  updateSetMock,
  updateWhereMock,
} = vi.hoisted(() => ({
  isMissingRelationErrorMock: vi.fn(),
  isUniqueConstraintErrorMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
  selectFromMock: vi.fn(),
  selectMock: vi.fn(),
  selectWhereMock: vi.fn(),
  updateMock: vi.fn(),
  updateReturningMock: vi.fn(),
  updateSetMock: vi.fn(),
  updateWhereMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceIdForRequest: requireCommerceIdForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    select: selectMock,
    update: updateMock,
  },
  isMissingRelationError: isMissingRelationErrorMock,
  isUniqueConstraintError: isUniqueConstraintErrorMock,
  schema: {
    product: {
      id: "product.id",
      status: "product.status",
    },
    productLink: {
      commerceId: "productLink.commerceId",
      id: "productLink.id",
      productId: "productLink.productId",
      slug: "productLink.slug",
    },
  },
}));

describe("product link by id route", () => {
  beforeEach(() => {
    vi.resetModules();
    isMissingRelationErrorMock.mockReset();
    isUniqueConstraintErrorMock.mockReset();
    requireCommerceIdForRequestMock.mockReset();
    selectMock.mockReset();
    selectFromMock.mockReset();
    selectWhereMock.mockReset();
    updateMock.mockReset();
    updateSetMock.mockReset();
    updateWhereMock.mockReset();
    updateReturningMock.mockReset();

    selectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      innerJoin: selectFromMock,
      where: selectWhereMock,
    }));

    updateMock.mockImplementation(() => ({
      set: updateSetMock,
    }));
    updateSetMock.mockImplementation(() => ({
      where: updateWhereMock,
    }));
    updateWhereMock.mockImplementation(() => ({
      returning: updateReturningMock,
    }));

    isMissingRelationErrorMock.mockReturnValue(false);
    isUniqueConstraintErrorMock.mockReturnValue(false);
  });

  test("returns 404 when the product link does not exist", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_missing", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_missing",
        }),
      }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Product link not found.",
    });
  });

  test("rejects changing the linked product", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_2",
          slug: "mate-premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Product links cannot be moved to a different product.",
    });
  });

  test("rejects duplicate slugs when updating", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([{ id: "link_existing" }]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        slug: ["Ya existe un link publico con ese slug."],
      },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  test("rejects past expiration dates when updating", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "2000-01-01T00:00:00.000Z",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        expiresAt: [
          "La fecha de expiracion debe ser posterior al momento actual.",
        ],
      },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  test("maps database uniqueness races for slug to a friendly conflict", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    updateReturningMock.mockRejectedValueOnce({
      cause: {
        code: "23505",
        constraint: "ProductLink_commerceId_slug_key",
      },
    });
    isUniqueConstraintErrorMock.mockImplementation(
      (_error, constraintName: string) =>
        constraintName === "ProductLink_commerceId_slug_key"
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: false,
          description: "Oferta ajustada",
          expiresAt: "",
          paymentRequired: true,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-vip",
          status: "active",
          title: "Mate VIP",
          unitPrice: 180_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        slug: ["Ya existe un link publico con ese slug."],
      },
    });
  });

  test("updates the link when the payload is valid", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    updateReturningMock.mockResolvedValue([{ id: "link_1" }]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: false,
          description: "Oferta ajustada",
          expiresAt: "",
          paymentRequired: true,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-vip",
          status: "active",
          title: "Mate VIP",
          unitPrice: 180_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "link_1",
      success: true,
    });
    expect(updateSetMock).toHaveBeenCalledWith({
      currency: "PYG",
      deliveryEnabled: false,
      description: "Oferta ajustada",
      expiresAt: null,
      paymentRequired: true,
      pickupEnabled: true,
      slug: "mate-vip",
      status: "active",
      title: "Mate VIP",
      unitPrice: 180_000,
    });
  });

  test("returns a migration error when ProductLink is missing", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockRejectedValueOnce(new Error("relation missing"));
    isMissingRelationErrorMock.mockReturnValue(true);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "Los links publicos no estan disponibles en esta base de datos. Ejecuta bun run db:migrate para aplicar las migraciones pendientes.",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  test("returns auth errors from the shared commerce resolver", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue(
      NextResponse.json(
        { error: "Commerce context is required." },
        { status: 400 }
      )
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce context is required.",
    });
  });

  test("updates the link when commerce id is resolved from the database instead of the session cookie", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "link_1",
        productId: "product_1",
        productStatus: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    updateReturningMock.mockResolvedValue([{ id: "link_db_resolved" }]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/product-links/link_1", {
        body: JSON.stringify({
          deliveryEnabled: false,
          description: "Oferta ajustada",
          expiresAt: "",
          paymentRequired: true,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-vip-db",
          status: "active",
          title: "Mate VIP DB",
          unitPrice: 180_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          linkId: "link_1",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "link_db_resolved",
      success: true,
    });
  });
});
