import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  deleteMock,
  deleteReturningMock,
  deleteWhereMock,
  requireCommerceIdForRequestMock,
  updateMock,
  updateReturningMock,
  updateSetMock,
  updateWhereMock,
} = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  deleteReturningMock: vi.fn(),
  deleteWhereMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
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
    delete: deleteMock,
    update: updateMock,
  },
  isForeignKeyConstraintError: (error: unknown) => {
    if (!error || typeof error !== "object") {
      return false;
    }

    const candidates = [
      error,
      "cause" in error ? error.cause : undefined,
    ] as Array<Record<string, unknown> | undefined>;

    return candidates.some((candidate) => candidate?.code === "23503");
  },
  schema: {
    product: {
      commerceId: "product.commerceId",
      id: "product.id",
    },
  },
}));

describe("product by id route", () => {
  beforeEach(() => {
    vi.resetModules();
    requireCommerceIdForRequestMock.mockReset();
    updateMock.mockReset();
    updateSetMock.mockReset();
    updateWhereMock.mockReset();
    updateReturningMock.mockReset();
    deleteMock.mockReset();
    deleteWhereMock.mockReset();
    deleteReturningMock.mockReset();

    updateMock.mockImplementation(() => ({
      set: updateSetMock,
    }));
    updateSetMock.mockImplementation(() => ({
      where: updateWhereMock,
    }));
    updateWhereMock.mockImplementation(() => ({
      returning: updateReturningMock,
    }));

    deleteMock.mockImplementation(() => ({
      where: deleteWhereMock,
    }));
    deleteWhereMock.mockImplementation(() => ({
      returning: deleteReturningMock,
    }));
  });

  test("updates a product for the authenticated commerce", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    updateReturningMock.mockResolvedValue([{ id: "product_1" }]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/products/product_1", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium para tu cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "product_1",
      success: true,
    });
    expect(updateSetMock).toHaveBeenCalledWith({
      category: "Electrodomesticos",
      deliveryIncluded: true,
      description: "Licuadora premium para tu cocina diaria.",
      image: "products/commerce_1/images/licuadora.png",
      images: {
        primary: "products/commerce_1/images/licuadora.png",
      },
      name: "Licuadora Cerramos",
      status: "active",
      stock: 14,
      unitPrice: 185_000,
    });
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
      new Request("http://localhost/api/products/product_1", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce context is required.",
    });
  });

  test("returns 404 when the product does not exist during update", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    updateReturningMock.mockResolvedValue([]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/products/product_missing", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion valida.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Producto",
          status: "draft",
          stock: 1,
          unitPrice: 1000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          productId: "product_missing",
        }),
      }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Product not found.",
    });
  });

  test("deletes a product for the authenticated commerce", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    deleteReturningMock.mockResolvedValue([{ id: "product_1" }]);

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/products/product_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "product_1",
      success: true,
    });
  });

  test("returns 404 when the product does not exist during delete", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    deleteReturningMock.mockResolvedValue([]);

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/products/product_missing", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          productId: "product_missing",
        }),
      }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Product not found.",
    });
  });

  test("returns 500 json when product deletion throws unexpectedly", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    deleteReturningMock.mockRejectedValue(new Error("db exploded"));

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/products/product_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo eliminar el producto.",
    });
  });

  test("returns 409 when the product still has public links", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    deleteReturningMock.mockRejectedValue({
      code: "23503",
    });

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/products/product_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error:
        "No puedes eliminar este producto mientras tenga links publicos asociados.",
    });
  });

  test("returns 409 when the foreign key violation is wrapped in cause", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    deleteReturningMock.mockRejectedValue({
      cause: {
        code: "23503",
      },
    });

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/products/product_1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error:
        "No puedes eliminar este producto mientras tenga links publicos asociados.",
    });
  });

  test("updates a product when commerce id is resolved from the database instead of the session cookie", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");
    updateReturningMock.mockResolvedValue([{ id: "product_db_resolved" }]);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/products/product_1", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium para tu cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          productId: "product_1",
        }),
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "product_db_resolved",
      success: true,
    });
  });
});
