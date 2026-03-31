import { describe, expect, test, vi } from "vitest";

const { requireCommerceContextMock, selectMock, fromMock, whereMock, orderByMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    orderByMock: vi.fn(),
    requireCommerceContextMock: vi.fn(),
    selectMock: vi.fn(),
    whereMock: vi.fn(),
  }));

const { createSignedReadUrlMock } = vi.hoisted(() => ({
  createSignedReadUrlMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContext: requireCommerceContextMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    select: selectMock,
  },
  schema: {
    product: {
      category: "product.category",
      commerceId: "product.commerceId",
      createdAt: "product.createdAt",
      deliveryIncluded: "product.deliveryIncluded",
      description: "product.description",
      id: "product.id",
      image: "product.image",
      name: "product.name",
      status: "product.status",
      stock: "product.stock",
    },
  },
}));

vi.mock("@repo/storage", () => ({
  createSignedReadUrl: createSignedReadUrlMock,
}));

vi.mock("./products-view", () => ({
  ProductsView: ({ products }: { products: unknown[] }) => (
    <pre>{JSON.stringify(products)}</pre>
  ),
}));

describe("products page", () => {
  test("resolves stored object keys into signed image URLs", async () => {
    requireCommerceContextMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
      },
    });

    selectMock.mockImplementation(() => ({
      from: fromMock,
    }));
    fromMock.mockImplementation(() => ({
      where: whereMock,
    }));
    whereMock.mockImplementation(() => ({
      orderBy: orderByMock,
    }));
    orderByMock.mockResolvedValue([
      {
        category: "Electrodomesticos",
        deliveryIncluded: false,
        description: "Descripcion",
        id: "product_1",
        image: "products/commerce_1/images/object.png",
        name: "Licuadora Cerramos",
        status: "active",
        stock: 14,
      },
      {
        category: "Electrodomesticos",
        deliveryIncluded: false,
        description: "Descripcion",
        id: "product_2",
        image: "/productos/legacy.png",
        name: "Legacy",
        status: "draft",
        stock: 1,
      },
    ]);
    createSignedReadUrlMock.mockResolvedValue({
      url: "https://signed.example.test/object.png",
    });

    const { default: ProductsPage } = await import("./page");
    const rendered = await ProductsPage();

    expect(createSignedReadUrlMock).toHaveBeenCalledWith({
      objectKey: "products/commerce_1/images/object.png",
    });
    expect(JSON.stringify(rendered)).toContain("https://signed.example.test/object.png");
    expect(JSON.stringify(rendered)).toContain("/productos/legacy.png");
  });
});
