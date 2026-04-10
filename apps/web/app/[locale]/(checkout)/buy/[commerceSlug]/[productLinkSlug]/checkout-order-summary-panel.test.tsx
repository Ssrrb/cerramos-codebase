import { CheckoutOrderSummaryPanel } from "@repo/design-system/components/checkout/checkout-order-summary-panel";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

const orderSummary = {
  shippingLabel: "A coordinar",
  subtotalLabel: "Gs. 145.000",
  totalLabel: "Gs. 145.000",
};

describe("checkout order summary panel", () => {
  test("renders the product image when a source is available", () => {
    const html = renderToStaticMarkup(
      <CheckoutOrderSummaryPanel
        orderSummary={orderSummary}
        product={{
          description: "Mate premium para regalo.",
          imageUrl: "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
          name: "Mate premium",
          priceLabel: "Gs. 145.000",
        }}
      />
    );

    expect(html).toContain('img');
    expect(html).toContain("Mate premium");
    expect(html).not.toContain("Imagen no disponible");
  });

  test("renders a fallback state instead of a broken image when the source is empty", () => {
    const html = renderToStaticMarkup(
      <CheckoutOrderSummaryPanel
        orderSummary={orderSummary}
        product={{
          description: "Mate premium para regalo.",
          imageUrl: "",
          name: "Mate premium",
          priceLabel: "Gs. 145.000",
        }}
      />
    );

    expect(html).not.toContain("<img");
    expect(html).toContain("Imagen no disponible");
  });
});
