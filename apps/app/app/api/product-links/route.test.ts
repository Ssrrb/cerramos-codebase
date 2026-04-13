import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  isMissingRelationErrorMock,
  isUniqueConstraintErrorMock,
  insertMock,
  insertReturningMock,
  insertValuesMock,
  requireCommerceIdForRequestMock,
  selectFromMock,
  selectMock,
  selectWhereMock,
} = vi.hoisted(() => ({
  isMissingRelationErrorMock: vi.fn(),
  isUniqueConstraintErrorMock: vi.fn(),
  insertMock: vi.fn(),
  insertReturningMock: vi.fn(),
  insertValuesMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
  selectFromMock: vi.fn(),
  selectMock: vi.fn(),
  selectWhereMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceIdForRequest: requireCommerceIdForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    insert: insertMock,
    select: selectMock,
  },
  isMissingRelationError: isMissingRelationErrorMock,
  isUniqueConstraintError: isUniqueConstraintErrorMock,
  schema: {
    product: {
      commerceId: "product.commerceId",
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

describe("product links route", () => {
  beforeEach(() => {
    vi.resetModules();
    isMissingRelationErrorMock.mockReset();
    isUniqueConstraintErrorMock.mockReset();
    insertMock.mockReset();
    insertValuesMock.mockReset();
    insertReturningMock.mockReset();
    requireCommerceIdForRequestMock.mockReset();
    selectMock.mockReset();
    selectFromMock.mockReset();
    selectWhereMock.mockReset();

    insertMock.mockImplementation(() => ({
      values: insertValuesMock,
    }));
    insertValuesMock.mockImplementation(() => ({
      returning: insertReturningMock,
    }));

    selectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      where: selectWhereMock,
    }));

    isMissingRelationErrorMock.mockReturnValue(false);
    isUniqueConstraintErrorMock.mockReturnValue(false);
  });

  test("rejects unauthenticated requests", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects invalid payloads", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
        body: JSON.stringify({
          deliveryEnabled: false,
          description: "",
          expiresAt: "not-a-date",
          paymentRequired: false,
          pickupEnabled: false,
          productId: "",
          slug: "",
          status: "draft",
          title: "",
          unitPrice: -1,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects activating links for draft products", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "draft",
      },
    ]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: false,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-premium",
          status: "active",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid product link data.",
      fieldErrors: {
        status: ["Solo puedes activar links de productos activos."],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects duplicate slugs within the same commerce", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([{ id: "link_existing" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
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
        method: "POST",
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        slug: ["Ya existe un link publico con ese slug."],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects creating a second link for the same product", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    selectWhereMock.mockResolvedValueOnce([{ id: "link_existing" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
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
        method: "POST",
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        productId: [
          "Este producto ya tiene un link publico. Edita el link actual en lugar de crear otro.",
        ],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects past expiration dates even when the payload is otherwise valid", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
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
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        expiresAt: [
          "La fecha de expiracion debe ser posterior al momento actual.",
        ],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("maps database uniqueness races for productId to a friendly conflict", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    selectWhereMock.mockResolvedValueOnce([]);
    insertReturningMock.mockRejectedValueOnce({
      cause: {
        code: "23505",
        constraint: "ProductLink_productId_key",
      },
    });
    isUniqueConstraintErrorMock.mockImplementation(
      (_error, constraintName: string) =>
        constraintName === "ProductLink_productId_key"
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
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
        method: "POST",
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        productId: [
          "Este producto ya tiene un link publico. Edita el link actual en lugar de crear otro.",
        ],
      },
    });
  });

  test("creates a product link for a valid product", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    selectWhereMock.mockResolvedValueOnce([]);
    insertReturningMock.mockResolvedValue([{ id: "link_1" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: true,
          pickupEnabled: true,
          productId: "product_1",
          slug: "Mate Premium",
          status: "draft",
          title: "Mate premium",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "link_1",
      success: true,
    });
    expect(insertValuesMock).toHaveBeenCalledWith({
      commerceId: "commerce_1",
      currency: "PYG",
      deliveryEnabled: true,
      description: "Oferta publica",
      expiresAt: null,
      paymentRequired: true,
      pickupEnabled: true,
      productId: "product_1",
      slug: "mate-premium",
      status: "draft",
      title: "Mate premium",
      unitPrice: 145_000,
    });
  });

  test("returns a migration error when ProductLink is missing", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockRejectedValueOnce(new Error("relation missing"));
    isMissingRelationErrorMock.mockReturnValue(true);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
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
        method: "POST",
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "Los links publicos no estan disponibles en esta base de datos. Ejecuta bun run db:migrate para aplicar las migraciones pendientes.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("creates a product link when commerce id is resolved from the database instead of the session cookie", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    selectWhereMock.mockResolvedValueOnce([
      {
        id: "product_1",
        status: "active",
      },
    ]);
    selectWhereMock.mockResolvedValueOnce([]);
    selectWhereMock.mockResolvedValueOnce([]);
    insertReturningMock.mockResolvedValue([{ id: "link_db_resolved" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/product-links", {
        body: JSON.stringify({
          deliveryEnabled: true,
          description: "Oferta publica",
          expiresAt: "",
          paymentRequired: true,
          pickupEnabled: true,
          productId: "product_1",
          slug: "mate-db",
          status: "draft",
          title: "Mate db",
          unitPrice: 145_000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "link_db_resolved",
      success: true,
    });
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        commerceId: "commerce_1",
      })
    );
  });
});
