import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  insertMock,
  insertReturningMock,
  insertValuesMock,
  requireCommerceIdForRequestMock,
} = vi.hoisted(() => ({
  insertMock: vi.fn(),
  insertReturningMock: vi.fn(),
  insertValuesMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceIdForRequest: requireCommerceIdForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    insert: insertMock,
  },
  schema: {
    product: {
      id: "product.id",
    },
  },
}));

describe("products route", () => {
  beforeEach(() => {
    vi.resetModules();
    insertMock.mockReset();
    insertReturningMock.mockReset();
    insertValuesMock.mockReset();
    requireCommerceIdForRequestMock.mockReset();

    insertMock.mockImplementation(() => ({
      values: insertValuesMock,
    }));
    insertValuesMock.mockImplementation(() => ({
      returning: insertReturningMock,
    }));
  });

  test("rejects unauthenticated requests", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects users without a commerce context", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue(
      NextResponse.json(
        { error: "Commerce context is required." },
        { status: 400 }
      )
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce context is required.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects invalid payloads", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "",
          deliveryIncluded: false,
          description: "",
          imageObjectKey: "",
          name: "",
          status: "draft",
          stock: -1,
          unitPrice: -1,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);

    const payload = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string[] | undefined>;
    };

    expect(payload.error).toBe("Invalid product data.");
    expect(payload.fieldErrors.name).toBeTruthy();
    expect(payload.fieldErrors.description).toBeTruthy();
    expect(payload.fieldErrors.stock).toBeTruthy();
    expect(payload.fieldErrors.unitPrice).toBeTruthy();
    expect(payload.fieldErrors.imageObjectKey).toBeTruthy();
    expect(payload.fieldErrors.category).toBeTruthy();
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("creates a product for the authenticated commerce", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    insertReturningMock.mockResolvedValue([{ id: "product_1" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium para tu cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "product_1",
      success: true,
    });
    expect(insertValuesMock).toHaveBeenCalledWith({
      category: "Electrodomesticos",
      commerceId: "commerce_1",
      deliveryIncluded: true,
      description: "Licuadora premium para tu cocina diaria.",
      image: "products/commerce_1/images/licuadora.png",
      images: {
        primary: "products/commerce_1/images/licuadora.png",
      },
      name: "Licuadora Cerramos",
      status: "active",
      stock: 14,
      unitPrice: 185000,
    });
  });

  test("normalizes bucket-prefixed image object keys before inserting", async () => {
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";

    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    insertReturningMock.mockResolvedValue([{ id: "product_2" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion",
          imageObjectKey:
            "imagenes-cerramos/products/commerce_1/images/object.png",
          name: "Producto con bucket",
          status: "draft",
          stock: 3,
          unitPrice: 5000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(insertValuesMock).toHaveBeenCalledWith({
      category: "Electrodomesticos",
      commerceId: "commerce_1",
      deliveryIncluded: false,
      description: "Descripcion",
      image: "products/commerce_1/images/object.png",
      images: {
        primary: "products/commerce_1/images/object.png",
      },
      name: "Producto con bucket",
      status: "draft",
      stock: 3,
      unitPrice: 5000,
    });
  });

  test("rejects blob preview urls as product image keys", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion",
          imageObjectKey: "blob:preview-image",
          name: "Producto invalido",
          status: "draft",
          stock: 3,
          unitPrice: 5000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid product data.",
      fieldErrors: {
        imageObjectKey: ["La imagen del producto es obligatoria."],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("creates a product when commerce id is resolved from the database instead of the session cookie", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    insertReturningMock.mockResolvedValue([{ id: "product_db_resolved" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium para tu cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185000,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "product_db_resolved",
      success: true,
    });
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        commerceId: "commerce_1",
      })
    );
  });
});
