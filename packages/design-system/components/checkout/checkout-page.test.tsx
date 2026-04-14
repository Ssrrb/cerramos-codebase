// @vitest-environment jsdom

import * as React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
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

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterAll(() => {
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
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
  test("opens the auth modal from the default ingresar action", () => {
    render(
      <CheckoutPage
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired
        product={product}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByText("Welcome back")).toBeDefined();
  });

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
