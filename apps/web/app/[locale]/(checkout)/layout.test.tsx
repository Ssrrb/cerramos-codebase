import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import CheckoutLayout from "./layout";

describe("checkout layout", () => {
  test("renders only the checkout children without marketing chrome", () => {
    const html = renderToStaticMarkup(
      <CheckoutLayout>
        <main>Checkout focused shell</main>
      </CheckoutLayout>
    );

    expect(html).toContain("Checkout focused shell");
    expect(html).toBe("<main>Checkout focused shell</main>");
  });
});
