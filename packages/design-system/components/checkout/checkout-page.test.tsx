// @vitest-environment jsdom

import * as React from "react";
import { afterEach, describe, expect, test } from "vitest";
import {
  cleanup,
  render,
  screen,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { CheckoutPage } from "./checkout-page";
import type {
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "./types";

afterEach(() => {
  cleanup();
});

const merchant: CheckoutMerchantSummary = {
  name: "Casa Nube",
  trustState: "verified",
};

const product: CheckoutProductSummary = {
  availableStock: 6,
  description: "Set matero con funda térmica.",
  imageUrl: "/mate.png",
  name: "Set matero",
  priceLabel: "Gs. 145.000",
  quantity: 1,
  unitPrice: 145_000,
};

const orderSummary: CheckoutOrderSummary = {
  shippingLabel: "A coordinar",
  subtotalLabel: "Gs. 145.000",
  totalLabel: "Gs. 145.000",
};

describe("CheckoutPage", () => {
  test("renders the account action in the page header", () => {
    render(
      <CheckoutPage
        accountAction={<button type="button">Ingresar</button>}
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired
        product={product}
      />
    );

    expect(screen.getByRole("button", { name: "Ingresar" })).toBeDefined();
  });

  test("renders checkout flow content inside the shared page shell", () => {
    render(
      <CheckoutPage
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired
        product={product}
      />
    );

    expect(screen.getAllByText("Casa Nube").length).toBeGreaterThan(0);
    expect(screen.getByText("Set matero")).toBeDefined();
  });

  test("renders optional footer content", () => {
    render(
      <CheckoutPage
        footerContent={<span>Powered by Cheki</span>}
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired={false}
        product={product}
      />
    );

    expect(screen.getByText("Powered by Cheki")).toBeDefined();
  });
});
