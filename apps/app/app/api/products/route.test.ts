import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSessionMock, insertMock, insertReturningMock, insertValuesMock } =
  vi.hoisted(() => ({
    getSessionMock: vi.fn(),
    insertMock: vi.fn(),
    insertReturningMock: vi.fn(),
    insertValuesMock: vi.fn(),
  }));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
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
    getSessionMock.mockReset();
    insertMock.mockReset();
    insertReturningMock.mockReset();
    insertValuesMock.mockReset();

    insertMock.mockImplementation(() => ({
      values: insertValuesMock,
    }));
    insertValuesMock.mockImplementation(() => ({
      returning: insertReturningMock,
    }));
  });

  test("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null);

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
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        id: "user_1",
      },
    });

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
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        id: "user_1",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "T-shirts",
          colors: ["blue"],
          description: "",
          images: {},
          name: "",
          shortDescription: "",
          sizes: [],
          unitPrice: 0,
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
    expect(payload.fieldErrors.shortDescription).toBeTruthy();
    expect(payload.fieldErrors.description).toBeTruthy();
    expect(payload.fieldErrors.unitPrice).toBeTruthy();
    expect(payload.fieldErrors.sizes).toBeTruthy();
    expect(payload.fieldErrors.images).toBeTruthy();
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("creates a product for the authenticated commerce", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        id: "user_1",
      },
    });
    insertReturningMock.mockResolvedValue([{ id: "product_1" }]);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products", {
        body: JSON.stringify({
          category: "T-shirts",
          colors: ["blue", "black"],
          description: "Camiseta principal para catalogo.",
          images: {
            black: "/productos/tee-black.png",
            blue: "/productos/tee-blue.png",
          },
          name: "Camiseta Cerramos",
          shortDescription: "Camiseta premium",
          sizes: ["m", "l"],
          unitPrice: 149_000,
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
      category: "T-shirts",
      colors: ["blue", "black"],
      commerceId: "commerce_1",
      currency: "PYG",
      description: "Camiseta principal para catalogo.",
      images: {
        black: "/productos/tee-black.png",
        blue: "/productos/tee-blue.png",
      },
      name: "Camiseta Cerramos",
      shortDescription: "Camiseta premium",
      sizes: ["m", "l"],
      unitPrice: 149_000,
    });
  });
});
