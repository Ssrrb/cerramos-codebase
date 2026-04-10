import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  randomUUIDMock,
  requireCommerceIdForRequestMock,
  transactionMock,
  txInsertMock,
} = vi.hoisted(() => ({
  randomUUIDMock: vi.fn(),
  requireCommerceIdForRequestMock: vi.fn(),
  transactionMock: vi.fn(),
  txInsertMock: vi.fn(),
}));

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();

  return {
    ...actual,
    randomUUID: randomUUIDMock,
  };
});

vi.mock("@repo/auth/server", () => ({
  requireCommerceIdForRequest: requireCommerceIdForRequestMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    transaction: transactionMock,
  },
  schema: {
    product: {
      id: "product.id",
    },
    productImage: {
      id: "productImage.id",
    },
  },
}));

describe("products route", () => {
  beforeEach(() => {
    vi.resetModules();
    randomUUIDMock.mockReset();
    requireCommerceIdForRequestMock.mockReset();
    transactionMock.mockReset();
    txInsertMock.mockReset();
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
    expect(transactionMock).not.toHaveBeenCalled();
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
    expect(transactionMock).not.toHaveBeenCalled();
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
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test("creates a product and canonical image row for the authenticated commerce", async () => {
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const insertedValues: Array<{
      table: "product" | "productImage";
      values: Record<string, unknown>;
    }> = [];

    txInsertMock.mockImplementation((table: { id?: string }) => ({
      values: (values: Record<string, unknown>) => {
        const tableName = table.id === "product.id" ? "product" : "productImage";
        insertedValues.push({
          table: tableName,
          values,
        });

        if (tableName === "product") {
          return {
            returning: async () => [{ id: "product_1" }],
          };
        }

        return Promise.resolve(undefined);
      },
    }));

    transactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
      })
    );

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
    expect(insertedValues).toHaveLength(2);
    const [productInsert, productImageInsert] = insertedValues;

    expect(productInsert).toMatchObject({
      table: "product",
      values: {
        category: "Electrodomesticos",
        commerceId: "commerce_1",
        deliveryIncluded: true,
        description: "Licuadora premium para tu cocina diaria.",
        name: "Licuadora Cerramos",
        status: "active",
        stock: 14,
        unitPrice: 185000,
      },
    });
    expect(productImageInsert).toMatchObject({
      table: "productImage",
      values: {
        objectKey: "products/commerce_1/images/licuadora.png",
        position: 0,
      },
    });
    expect(productInsert?.values.id).toEqual(expect.any(String));
    expect(productInsert?.values.primaryImageId).toEqual(expect.any(String));
    expect(productImageInsert?.values.id).toBe(productInsert?.values.primaryImageId);
    expect(productImageInsert?.values.productId).toBe(productInsert?.values.id);
  });

  test("normalizes bucket-prefixed image object keys before inserting", async () => {
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    requireCommerceIdForRequestMock.mockResolvedValue("commerce_1");

    const insertedValues: Record<string, unknown>[] = [];

    txInsertMock.mockImplementation(() => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push(values);

        return {
          returning: async () => [{ id: "product_2" }],
        };
      },
    }));

    transactionMock.mockImplementation(async (callback) =>
      callback({
        insert: txInsertMock,
      })
    );

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
    expect(insertedValues[1]).toMatchObject({
      objectKey: "products/commerce_1/images/object.png",
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
    expect(transactionMock).not.toHaveBeenCalled();
  });
});
