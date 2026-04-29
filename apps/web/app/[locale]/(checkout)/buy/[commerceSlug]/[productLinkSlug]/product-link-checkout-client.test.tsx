// @vitest-environment jsdom

import { act, type ReactNode, useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../app/node_modules/@testing-library/react";
import { ProductLinkCheckoutClient } from "./product-link-checkout-client";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

vi.mock(
  "@repo/design-system/components/checkout/checkout-upay-card-loader",
  () => ({
    CheckoutUpayCardLoader: ({ formId }: { formId?: string | null }) => (
      <div data-testid="upay-loader">{formId ?? "missing-form-id"}</div>
    ),
  })
);

vi.mock("./checkout-auth-action", () => ({
  CheckoutAuthAction: ({
    googleEnabled,
    initialUser,
  }: {
    googleEnabled?: boolean;
    initialUser?: { email: string; name?: string | null } | null;
  }) => (
    <div>
      {googleEnabled ? "auth-enabled" : "auth-disabled"}:
      {initialUser?.email ?? "guest"}
    </div>
  ),
}));

vi.mock("@repo/design-system/components/checkout/checkout-page", () => ({
  CheckoutPage: ({
    accountAction,
    footerContent,
    isOrderConfirmed,
    onPaymentConfirm,
    onReset,
    onSaveDetails,
    onSubmit,
    orderReference,
    paymentStage,
    processorSlot,
  }: {
    accountAction?: ReactNode;
    footerContent?: ReactNode;
    isOrderConfirmed?: boolean;
    onPaymentConfirm?: () => Promise<string | null | undefined>;
    onReset?: () => void;
    onSaveDetails?: (values: {
      cityId: string;
      countryId: string;
      customerAddressId?: string;
      email: string;
      mode: "delivery" | "pickup";
      notes: string;
      phone: string;
      postalCode: string;
      quantity: number;
      referenceNote: string;
      recipientName: string;
      saveAddress?: boolean;
      saveAsDefault?: boolean;
      stateId: string;
      streetLine1: string;
      streetLine2: string;
    }) => Promise<string | null | undefined>;
    onSubmit?: (values: {
      cityId: string;
      countryId: string;
      customerAddressId?: string;
      email: string;
      mode: "delivery" | "pickup";
      notes: string;
      phone: string;
      postalCode: string;
      quantity: number;
      referenceNote: string;
      recipientName: string;
      saveAddress?: boolean;
      saveAsDefault?: boolean;
      stateId: string;
      streetLine1: string;
      streetLine2: string;
    }) => Promise<string | null | undefined>;
    orderReference?: string | null;
    paymentStage?: string;
    processorSlot?: ReactNode;
  }) => {
    const [submitResult, setSubmitResult] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<string | null>(null);
    const [saveResult, setSaveResult] = useState<string | null>(null);
    const checkoutValues = {
      cityId: "city_db_asuncion",
      countryId: "country_db_py",
      customerAddressId: "",
      email: "buyer@example.com",
      mode: "delivery" as const,
      notes: "",
      postalCode: "",
      phone: "0981000000",
      quantity: 2,
      referenceNote: "",
      recipientName: "Buyer Name",
      saveAddress: false,
      saveAsDefault: false,
      stateId: "state_db_asuncion",
      streetLine1: "Av. Espana 742",
      streetLine2: "",
    };

    return (
      <div>
        <div data-testid="account-action">{accountAction}</div>
        <div data-testid="footer-content">{footerContent}</div>
        <div data-testid="confirmed">{String(Boolean(isOrderConfirmed))}</div>
        <div data-testid="order-reference">{orderReference ?? "none"}</div>
        <div data-testid="payment-stage">{paymentStage ?? "idle"}</div>
        <div data-testid="submit-result">{submitResult ?? "none"}</div>
        <div data-testid="payment-result">{paymentResult ?? "none"}</div>
        <div data-testid="save-result">{saveResult ?? "none"}</div>
        <div data-testid="processor-slot">{processorSlot}</div>
        <button
          onClick={async () => {
            const result = await onSubmit?.(checkoutValues);

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
        {onSaveDetails ? (
          <button
            onClick={async () => {
              const result = await onSaveDetails(checkoutValues);
              setSaveResult(result ?? "success");
            }}
            type="button"
          >
            save-details
          </button>
        ) : null}
      </div>
    );
  },
}));

const baseProps = {
  commerceSlug: "mate-shop",
  deliveryEnabled: true,
  initialLocationData: {
    cities: [
      {
        label: "Asunción",
        stateId: "state_db_asuncion",
        value: "city_db_asuncion",
      },
    ],
    countries: [
      {
        label: "Paraguay",
        value: "country_db_py",
      },
    ],
    states: [
      {
        countryId: "country_db_py",
        label: "Asunción",
        value: "state_db_asuncion",
      },
    ],
  },
  initialSavedAddresses: [],
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
      <ProductLinkCheckoutClient {...baseProps} paymentRequired={false} />
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

  test("renders the shared checkout page chrome props", () => {
    render(<ProductLinkCheckoutClient {...baseProps} />);

    expect(screen.getByTestId("account-action").textContent).toBe(
      "auth-disabled:guest"
    );
    expect(screen.getByTestId("footer-content").textContent).toContain(
      "Powered by Cheki"
    );
  });

  test("passes the server-resolved auth user into the checkout auth action", () => {
    render(
      <ProductLinkCheckoutClient
        {...baseProps}
        initialAuthUser={{
          email: "buyer@example.com",
          name: "Buyer",
        }}
      />
    );

    expect(screen.getByTestId("account-action").textContent).toBe(
      "auth-disabled:buyer@example.com"
    );
  });

  test("posts saved details for signed-in confirmed checkouts", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true }),
      ok: true,
    } as Response);

    render(
      <ProductLinkCheckoutClient
        {...baseProps}
        initialAuthUser={{
          email: "buyer@example.com",
          name: "Buyer",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "save-details" }));

    await waitFor(() => {
      expect(screen.getByTestId("save-result").textContent).toBe("success");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/checkout/saved-details",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    ).toMatchObject({
      email: "buyer@example.com",
      phone: "0981000000",
      recipientName: "Buyer Name",
    });
  });

  test("does not expose saved details action to guests", () => {
    render(<ProductLinkCheckoutClient {...baseProps} />);

    expect(screen.queryByRole("button", { name: "save-details" })).toBeNull();
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

    await act(() => {
      fireEvent.click(screen.getByRole("button", { name: "submit" }));
    });

    expect(screen.getByTestId("payment-stage").textContent).toBe(
      "initializing"
    );
    expect(screen.getByTestId("order-reference").textContent).toBe(
      "ord_payment"
    );
    expect(screen.queryByText("Referencia")).toBeNull();
    expect(screen.getByTestId("upay-loader").textContent).toBe("form_payment");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(screen.getByTestId("payment-stage").textContent).toBe("ready");

    await act(() => {
      fireEvent.click(screen.getByRole("button", { name: "confirm-payment" }));
    });

    await act(async () => {
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
      <ProductLinkCheckoutClient {...baseProps} paymentRequired={false} />
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
