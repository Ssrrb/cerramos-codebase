import { describe, expect, test, vi } from "vitest";

const {
  requireCommerceContextMock,
  selectMock,
  fromMock,
  whereMock,
  orderByMock,
  isMissingRelationErrorMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  isMissingRelationErrorMock: vi.fn(() => false),
  orderByMock: vi.fn(),
  requireCommerceContextMock: vi.fn(),
  selectMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContext: requireCommerceContextMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    select: selectMock,
  },
  isMissingRelationError: isMissingRelationErrorMock,
  schema: {
    product: {
      category: "product.category",
      commerceId: "product.commerceId",
      createdAt: "product.createdAt",
      deliveryIncluded: "product.deliveryIncluded",
      description: "product.description",
      id: "product.id",
      primaryImageId: "product.primaryImageId",
      name: "product.name",
      status: "product.status",
      stock: "product.stock",
      unitPrice: "product.unitPrice",
    },
    productImage: {
      id: "productImage.id",
      objectKey: "productImage.objectKey",
    },
    productLink: {
      commerceId: "productLink.commerceId",
      createdAt: "productLink.createdAt",
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
    },
  },
}));

vi.mock("./products-view", () => ({
  ProductsView: ({ products }: { products: unknown[] }) => (
    <pre>{JSON.stringify(products)}</pre>
  ),
}));

describe("products page", () => {
  test("maps stored object keys to same-origin product image routes", async () => {
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";

    requireCommerceContextMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
      },
    });

    selectMock.mockImplementation(() => ({
      from: fromMock,
    }));
    fromMock.mockImplementation(() => ({
      innerJoin: fromMock,
      where: whereMock,
    }));
    whereMock.mockImplementation(() => ({
      orderBy: orderByMock,
    }));
    orderByMock
      .mockResolvedValueOnce([
        {
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion",
          id: "product_1",
          image: "products/commerce_1/images/object.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        },
        {
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion",
          id: "product_2",
          image: "imagenes-cerramos/products/commerce_1/images/bucket-object.png",
          name: "Bucket prefixed",
          status: "draft",
          stock: 1,
          unitPrice: 99_000,
        },
        {
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Descripcion",
          id: "product_3",
          image: "/productos/legacy.png",
          name: "Legacy",
          status: "draft",
          stock: 1,
          unitPrice: 50_000,
        },
      ])
      .mockResolvedValueOnce([]);
    const { default: ProductsPage } = await import("./page");
    const rendered = await ProductsPage();

    expect(JSON.stringify(rendered)).toContain(
      "/api/products/image?objectKey=products%2Fcommerce_1%2Fimages%2Fobject.png"
    );
    expect(JSON.stringify(rendered)).toContain(
      "/api/products/image?objectKey=products%2Fcommerce_1%2Fimages%2Fbucket-object.png"
    );
    expect(JSON.stringify(rendered)).toContain("/productos/legacy.png");
  });
});
