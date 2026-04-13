// @vitest-environment jsdom

import { CheckoutMobileSummaryBar } from "@repo/design-system/components/checkout/checkout-order-summary-panel";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../app/node_modules/@testing-library/react";

const VER_RESUMEN_BUTTON_NAME = /ver resumen/i;

afterEach(() => {
  document.body.innerHTML = "";
});

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
});

const orderSummary = {
  shippingLabel: "A coordinar",
  subtotalLabel: "Gs. 145.000",
  totalLabel: "Gs. 145.000",
};

describe("checkout mobile summary bar", () => {
  test("moves focus away from the trigger when the drawer opens", async () => {
    render(
      <CheckoutMobileSummaryBar
        orderSummary={orderSummary}
        product={{
          availableStock: 5,
          description: "Mate premium para regalo.",
          imageUrl:
            "/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
          name: "Mate premium",
          priceLabel: "Gs. 145.000",
          quantity: 1,
          unitPrice: 145_000,
        }}
      />
    );

    const trigger = screen.getByRole("button", {
      name: VER_RESUMEN_BUTTON_NAME,
    });
    trigger.focus();

    fireEvent.click(trigger);

    const title = await screen.findByText("Resumen del pedido");

    await waitFor(() => {
      expect(document.activeElement).not.toBe(trigger);
    });

    expect(title.closest<HTMLElement>("[data-slot='drawer-content']")).toBe(
      document.activeElement
    );
  });
});
