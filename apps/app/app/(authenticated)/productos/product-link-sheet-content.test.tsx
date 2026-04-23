import { render, screen } from "@testing-library/react";
import { Sheet } from "@repo/design-system/components/ui/sheet";
import { describe, expect, test, vi } from "vitest";

vi.mock("./product-link-form", () => ({
  ProductLinkForm: () => <div>link form body</div>,
}));

import { ProductLinkSheetContent } from "./product-link-sheet-content";

const product = {
  category: "Electrodomesticos",
  commerceSlug: "cerramos",
  deliveryIncluded: true,
  description: "Descripcion base",
  id: "product_1",
  image: "https://cdn.example.test/licuadora.png",
  imageObjectKey: "products/commerce_1/images/licuadora.png",
  kind: "product" as const,
  name: "Licuadora Cerramos",
  productLink: null,
  status: "active" as const,
  stock: 10,
  unitPrice: 185_000,
};

describe("product link sheet content", () => {
  test("frames link publishing as the second step after product creation", () => {
    render(
      <Sheet open>
        <ProductLinkSheetContent product={product} />
      </Sheet>
    );

    expect(screen.getByText("2. Publicar checkout público")).toBeDefined();
    expect(
      screen.getByText(
        "Después de guardar el producto, definí cómo se presenta y se publica su link de checkout."
      )
    ).toBeDefined();
    expect(screen.getByText("link form body")).toBeDefined();
  });
});
