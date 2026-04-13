// @vitest-environment jsdom

import * as React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../app/node_modules/@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ProductLinkCheckoutClient } from "./product-link-checkout-client";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

vi.mock("@repo/design-system/components/checkout/checkout-upay-card-loader", () => ({
  CheckoutUpayCardLoader: ({ formId }: { formId?: string | null }) => (
    <div data-testid="upay-loader">{formId ?? "missing-form-id"}</div>
  ),
}));

vi.mock("@repo/design-system/components/checkout/checkout-progressive-flow", () => ({
  CheckoutProgressiveFlow: ({
    isOrderConfirmed,
    onPaymentConfirm,
    onReset,
    onSubmit,
    orderReference,
    paymentStage,
    processorSlot,
  }: {
    isOrderConfirmed?: boolean;
    onPaymentConfirm?: () => Promise<string | null | undefined>;
    onReset?: () => void;
    onSubmit?: (values: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      email: string;
      mode: "delivery" | "pickup";
      notes: string;
      phone: string;
      quantity: number;
      recipientName: string;
      reference: string;
    }) => Promise<string | null | undefined>;
    orderReference?: string | null;
    paymentStage?: string;
    processorSlot?: React.ReactNode;
  }) => {
    const [submitResult, setSubmitResult] = React.useState<string | null>(null);
    const [paymentResult, setPaymentResult] = React.useState<string | null>(null);

    return (
      <div>
        <div data-testid="confirmed">{String(Boolean(isOrderConfirmed))}</div>
        <div data-testid="order-reference">{orderReference ?? "none"}</div>
        <div data-testid="payment-stage">{paymentStage ?? "idle"}</div>
        <div data-testid="submit-result">{submitResult ?? "none"}</div>
        <div data-testid="payment-result">{paymentResult ?? "none"}</div>
        <div data-testid="processor-slot">{processorSlot}</div>
        <button
          onClick={async () => {
            const result = await onSubmit?.({
              addressLine1: "Av. Espana 742",
              addressLine2: "",
              city: "Asuncion",
              email: "buyer@example.com",
              mode: "delivery",
              notes: "",
              phone: "0981000000",
              quantity: 2,
              recipientName: "Buyer Name",
              reference: "",
            });

            setSubmitResult(result ?? "success");
          }}
          type="button"
        >
          submit
        </button>
        <button
          onClick={async () => {
            const result = await onPaymentConfirm?.();
            setPaymentResult(result ?? "success");
          }}
          type="button"
        >
          confirm-payment
        </button>
        <button onClick={onReset} type="button">
          reset
        </button>
      </div>
    );
  },
}));

const baseProps = {
  commerceSlug: "mate-shop",
  deliveryEnabled: true,
  merchant: {
    name: "Mate Shop",
    trustState: "verified" as const,
  },
  orderSummary: {
    shippingLabel: "A coordinar",
    subtotalLabel: "Gs. 145.000",
    totalLabel: "Gs. 145.000",
  },
  paymentRequired: true,
  pickupEnabled: true,
  product: {
    availableStock: 5,
    description: "Mate premium",
    imageUrl: "/mate.png",
    name: "Mate premium",
    priceLabel: "Gs. 145.000",
    quantity: 1,
    unitPrice: 145_000,
  },
  productLinkSlug: "mate-premium",
};

describe("product link checkout client", () => {
  beforeEach(() => {
    // React 19 expects this flag when tests drive state through act().
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("confirms non-payment orders immediately after creation", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        orderId: "ord_non_payment",
        paymentIntentId: null,
        paymentRequired: false,
        success: true,
        upayFormId: null,
      }),
      ok: true,
    } as Response);

    render(
      <ProductLinkCheckoutClient
        {...baseProps}
        paymentRequired={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("confirmed").textContent).toBe("true");
    });

    expect(screen.getByTestId("order-reference").textContent).toBe(
      "ord_non_payment"
    );

    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    await waitFor(() => {
      expect(screen.getByTestId("confirmed").textContent).toBe("false");
    });

    expect(screen.getByTestId("order-reference").textContent).toBe("none");
  });

  test("transitions payment checkouts from initializing to ready and confirms them", async () => {
    vi.useFakeTimers();

    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        orderId: "ord_payment",
        paymentIntentId: "pi_payment",
        paymentRequired: true,
        success: true,
        upayFormId: "form_payment",
      }),
      ok: true,
    } as Response);

    render(<ProductLinkCheckoutClient {...baseProps} />);

    await React.act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
    });

    expect(screen.getByTestId("payment-stage").textContent).toBe("initializing");
    expect(screen.getByTestId("order-reference").textContent).toBe(
      "ord_payment"
    );
    expect(screen.getByTestId("upay-loader").textContent).toBe("form_payment");

    await React.act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(screen.getByTestId("payment-stage").textContent).toBe("ready");

    await React.act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "confirm-payment" }));
    });

    await React.act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByTestId("confirmed").textContent).toBe("true");
  });

  test("returns the first field validation error from the order API", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        error: "Invalid checkout data.",
        fieldErrors: {
          email: ["Ingresa un email valido."],
        },
      }),
      ok: false,
    } as Response);

    render(<ProductLinkCheckoutClient {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("submit-result").textContent).toBe(
        "Ingresa un email valido."
      );
    });
  });

  test("sends quantity in the order creation payload", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        orderId: "ord_qty",
        paymentIntentId: null,
        paymentRequired: false,
        success: true,
        upayFormId: null,
      }),
      ok: true,
    } as Response);

    render(
      <ProductLinkCheckoutClient
        {...baseProps}
        paymentRequired={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(requestInit?.body).toBeDefined();
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      quantity: 2,
    });
  });
});
