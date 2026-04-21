// @vitest-environment jsdom

import * as React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { CheckoutOrderSummaryPanel } from "./checkout-order-summary-panel";

vi.mock("@repo/design-system/components/ui/drawer", () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
});

const orderSummary = {
  shippingLabel: "A coordinar",
  subtotalLabel: "Gs. 145.000",
  totalLabel: "Gs. 145.000",
};

describe("checkout order summary quantity", () => {
  test("disables decrement at one unit and increment at max stock", () => {
    render(
      <CheckoutOrderSummaryPanel
        onQuantityChange={() => undefined}
        orderSummary={orderSummary}
        product={{
          availableStock: 1,
          description: "Mate premium",
          imageUrl: "/mate.png",
          name: "Mate premium",
          priceLabel: "Gs. 145.000",
          quantity: 1,
          unitPrice: 145_000,
        }}
      />
    );

    expect(
      screen
        .getByRole("button", { name: "Reducir cantidad" })
        .getAttribute("disabled")
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Aumentar cantidad" })
        .getAttribute("disabled")
    ).not.toBeNull();
  });

  test("emits quantity changes and recomputes totals", () => {
    function Harness() {
      const [quantity, setQuantity] = React.useState(1);

      return (
        <CheckoutOrderSummaryPanel
          onQuantityChange={setQuantity}
          orderSummary={orderSummary}
          product={{
            availableStock: 4,
            description: "Mate premium",
            imageUrl: "/mate.png",
            name: "Mate premium",
            priceLabel: "Gs. 145.000",
            quantity,
            unitPrice: 145_000,
          }}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Aumentar cantidad" }));

    expect(screen.getByText("290.000", { exact: false })).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  test("shows out-of-stock copy when inventory is exhausted", () => {
    render(
      <CheckoutOrderSummaryPanel
        onQuantityChange={() => undefined}
        orderSummary={orderSummary}
        product={{
          availableStock: 0,
          description: "Mate premium",
          imageUrl: "/mate.png",
          name: "Mate premium",
          priceLabel: "Gs. 145.000",
          quantity: 1,
          unitPrice: 145_000,
        }}
      />
    );

    expect(screen.getByText("Sin stock disponible")).toBeDefined();
  });
});
