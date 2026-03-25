import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { authMock, getProductsCatalogDataMock, redirectMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    getProductsCatalogDataMock: vi.fn(),
    redirectMock: vi.fn(),
  })
);

vi.mock("@repo/auth/server", () => ({
  auth: authMock,
}));

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("./products-catalog.server", () => ({
  getProductsCatalogData: getProductsCatalogDataMock,
}));

vi.mock("./actions/product-links", () => ({
  createProductLinkAction: vi.fn(),
}));

vi.mock("./components/products-catalog", () => ({
  ProductsCatalog: ({ products }: { products: Array<{ id: string }> }) => (
    <div>catalog:{products.length}</div>
  ),
}));

import Page from "./page";

describe("authenticated home page", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockReset();
    getProductsCatalogDataMock.mockReset();
  });

  test("redirects users without a commerce to onboarding", async () => {
    authMock.mockResolvedValue({ orgId: null });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/onboarding");
  });

  test("renders the products catalog with loaded data", async () => {
    authMock.mockResolvedValue({ orgId: "commerce_123" });
    getProductsCatalogDataMock.mockResolvedValue({
      metrics: [],
      products: [{ id: "prod_1" }, { id: "prod_2" }],
    });

    render(await Page());

    expect(screen.getByText("catalog:2")).toBeDefined();
  });
});
