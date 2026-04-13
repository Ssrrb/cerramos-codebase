import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  deleteMock,
  deleteReturningMock,
  deleteWhereMock,
  requireCommerceIdForRequestMock,
  schemaMock,
  transactionMock,
} = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  deleteReturningMock: vi.fn(),
  deleteWhereMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
  schemaMock: {
    product: {
      commerceId: "product.commerceId",
      id: "product.id",
      primaryImageId: "product.primaryImageId",
    },
    productImage: {
      id: "productImage.id",
      objectKey: "productImage.objectKey",
      productId: "productImage.productId",
    },
  },
  transactionMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceIdForRequest: requireCommerceIdForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    delete: deleteMock,
    transaction: transactionMock,
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
  schema: schemaMock,
}));

describe("product by id route", () => {
  beforeEach(() => {
    vi.resetModules();
    requireCommerceIdForRequestMock.mockReset();
    transactionMock.mockReset();
    deleteMock.mockReset();
    deleteWhereMock.mockReset();
    deleteReturningMock.mockReset();

    deleteMock.mockImplementation(() => ({
      where: deleteWhereMock,
    }));
    deleteWhereMock.mockImplementation(() => ({
      returning: deleteReturningMock,
    }));
  });

  test("updates a product without replacing the image when the object key is unchanged", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const productImageUpdateSetCalls: Array<Record<string, unknown>> = [];
    const updateSetCalls: Array<Record<string, unknown>> = [];

    transactionMock.mockImplementation(async (callback) =>
      callback({
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: async () => [
                {
                  id: "product_1",
                  primaryImageId: "product_image_1",
                  primaryImageObjectKey:
                    "products/commerce_1/images/licuadora.png",
                },
              ],
            }),
          }),
        }),
        update: (table: unknown) => {
          if (table === schemaMock.productImage) {
            return {
              set: (values: Record<string, unknown>) => {
                productImageUpdateSetCalls.push(values);
                return {
                  where: async () => undefined,
                };
              },
            };
          }

          return {
            set: (values: Record<string, unknown>) => {
              updateSetCalls.push(values);
              return {
                where: () => ({
                  returning: async () => [{ id: "product_1" }],
                }),
              };
            },
          };
        },
      })
    );

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
    expect(updateSetCalls).toEqual([
      {
        category: "Electrodomesticos",
        deliveryIncluded: true,
        description: "Licuadora premium para tu cocina diaria.",
        name: "Licuadora Cerramos",
        primaryImageId: "product_image_1",
        status: "active",
        stock: 14,
        unitPrice: 185_000,
      },
    ]);
    expect(productImageUpdateSetCalls).toHaveLength(0);
  });

  test("updates the canonical product image in place when the object key changes", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const productImageUpdateSetCalls: Array<Record<string, unknown>> = [];
    const updateSetCalls: Array<Record<string, unknown>> = [];

    transactionMock.mockImplementation(async (callback) =>
      callback({
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: async () => [
                {
                  id: "product_1",
                  primaryImageId: "product_image_1",
                  primaryImageObjectKey:
                    "products/commerce_1/images/licuadora-vieja.png",
                },
              ],
            }),
          }),
        }),
        update: (table: unknown) => {
          if (table === schemaMock.productImage) {
            return {
              set: (values: Record<string, unknown>) => {
                productImageUpdateSetCalls.push(values);
                return {
                  where: async () => undefined,
                };
              },
            };
          }

          return {
            set: (values: Record<string, unknown>) => {
              updateSetCalls.push(values);
              return {
                where: () => ({
                  returning: async () => [{ id: "product_1" }],
                }),
              };
            },
          };
        },
      })
    );

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/products/product_1", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium para tu cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora-nueva.png",
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
    expect(productImageUpdateSetCalls).toEqual([
      {
        objectKey: "products/commerce_1/images/licuadora-nueva.png",
      },
    ]);
    expect(updateSetCalls).toEqual([
      {
        category: "Electrodomesticos",
        deliveryIncluded: true,
        description: "Licuadora premium para tu cocina diaria.",
        name: "Licuadora Cerramos",
        primaryImageId: "product_image_1",
        status: "active",
        stock: 14,
        unitPrice: 185_000,
      },
    ]);
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
    transactionMock.mockImplementation(async (callback) =>
      callback({
        delete: () => ({
          where: () => Promise.resolve(undefined),
        }),
        insert: () => ({
          values: () => Promise.resolve(undefined),
        }),
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: async () => [],
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: async () => [],
            }),
          }),
        }),
      })
    );

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
});
