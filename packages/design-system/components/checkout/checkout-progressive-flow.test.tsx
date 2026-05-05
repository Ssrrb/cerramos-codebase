// @vitest-environment jsdom

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
  waitFor,
} from "../../../../apps/app/node_modules/@testing-library/react";
import {
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityOptions,
} from "./checkout-paraguay-locations";
import { CheckoutProgressiveFlow } from "./checkout-progressive-flow";
import type {
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutSavedAddress,
} from "./types";

const centralStateOption = checkoutParaguayStateOptions.find(
  (option) => option.label === "Central"
);
const sanLorenzoCityOption = getCheckoutParaguayCityOptions(
  centralStateOption?.value
).find((option) => option.label === "San Lorenzo");

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

const savedAddresses: CheckoutSavedAddress[] = [
  {
    cityId: sanLorenzoCityOption?.value ?? "city_py_san_lorenzo",
    countryId: checkoutParaguayCountryOption.value,
    id: "address_default",
    isDefault: true,
    label: "Casa",
    postalCode: "1000",
    recipientName: "Camila Ferreira",
    referenceNote: "Portón negro",
    stateId: centralStateOption?.value ?? "state_py_central",
    streetLine1: "Av. España 742 casi Perú",
    streetLine2: "Depto 204",
    summary: "Av. España 742 casi Perú, San Lorenzo",
  },
];
const multipleSavedAddresses: CheckoutSavedAddress[] = [
  ...savedAddresses,
  {
    cityId: sanLorenzoCityOption?.value ?? "city_py_san_lorenzo",
    countryId: checkoutParaguayCountryOption.value,
    id: "address_work",
    isDefault: false,
    label: "Trabajo",
    postalCode: "1200",
    recipientName: "Camila Ferreira",
    referenceNote: "Recepción",
    stateId: centralStateOption?.value ?? "state_py_central",
    streetLine1: "Ruta 2 Km 14",
    streetLine2: "",
    summary: "Ruta 2 Km 14, San Lorenzo",
  },
];

const fillDetailsStep = () => {
  fireEvent.change(screen.getByLabelText("Nombre y apellido"), {
    target: { value: "Camila Ferreira" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "camila@cerramos.com" },
  });
  fireEvent.change(screen.getByLabelText("Teléfono"), {
    target: { value: "0981123456" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: continueFromDetailsPattern,
    })
  );
};

const continueFromDetailsPattern = /Continuar a (entrega|coordinación|pago)/;

describe("CheckoutProgressiveFlow", () => {
  const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollIntoView"
  );

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterAll(() => {
    if (scrollIntoViewDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollIntoView",
        scrollIntoViewDescriptor
      );
      return;
    }

    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("auto-fills the preferred saved address and removes the saved-address branch UI", async () => {
    render(
      <CheckoutProgressiveFlow
        allowSavedAddresses
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired={false}
        product={product}
        savedAddresses={savedAddresses}
      />
    );

    fillDetailsStep();

    await waitFor(() => {
      expect(
        (screen.getByLabelText("Dirección") as HTMLInputElement).value
      ).toBe("Av. España 742 casi Perú");
    });

    expect(
      (screen.getByLabelText("Referencia") as HTMLInputElement).value
    ).toBe("Portón negro");
    expect(screen.queryByText("Dirección guardada")).toBeNull();
    expect(screen.queryByText("Nueva dirección")).toBeNull();
    expect(
      screen.queryByText("Guardar esta dirección en mi cuenta")
    ).toBeNull();
    expect(screen.queryByText("Usar como dirección predeterminada")).toBeNull();
  });

  test("clears the saved address id when the auto-filled address is edited before submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);

    render(
      <CheckoutProgressiveFlow
        allowSavedAddresses
        merchant={merchant}
        onSubmit={onSubmit}
        orderSummary={orderSummary}
        paymentRequired={false}
        product={product}
        savedAddresses={savedAddresses}
      />
    );

    fillDetailsStep();

    await waitFor(() => {
      expect(
        (screen.getByLabelText("Dirección") as HTMLInputElement).value
      ).toBe("Av. España 742 casi Perú");
    });

    fireEvent.change(screen.getByLabelText("Dirección"), {
      target: { value: "Av. Mariscal López 1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continuar a pago" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Confirmar pedido" })
      ).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      customerAddressId: "",
      referenceNote: "Portón negro",
      streetLine1: "Av. Mariscal López 1234",
    });
  });

  test("shows a saved-address dropdown when multiple addresses are available", async () => {
    render(
      <CheckoutProgressiveFlow
        allowSavedAddresses
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired={false}
        product={product}
        savedAddresses={multipleSavedAddresses}
      />
    );

    fillDetailsStep();

    await waitFor(() => {
      expect(screen.getByText("Dirección guardada")).toBeDefined();
    });

    expect(
      screen.getByRole("combobox", { name: "Dirección guardada" })
    ).toBeDefined();
  });

  test("skips the fulfillment step and submits from details into payment", async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);

    render(
      <CheckoutProgressiveFlow
        merchant={merchant}
        onSubmit={onSubmit}
        orderSummary={orderSummary}
        paymentRequired={false}
        product={product}
        skipFulfillmentStep
      />
    );

    fireEvent.change(screen.getByLabelText("Nombre y apellido"), {
      target: { value: "Camila Ferreira" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "camila@cerramos.com" },
    });
    fireEvent.change(screen.getByLabelText("Teléfono"), {
      target: { value: "0981123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar a pago" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Confirmar pedido" })
      ).toBeDefined();
    });

    expect(screen.queryByText("Cómo querés recibir este pedido")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      email: "camila@cerramos.com",
      mode: "pickup",
      recipientName: "Camila Ferreira",
    });
  });

  test("renders subscription copy when the subscription variant is enabled", async () => {
    render(
      <CheckoutProgressiveFlow
        copyVariant="subscription"
        merchant={merchant}
        orderSummary={orderSummary}
        paymentRequired
        product={product}
        skipFulfillmentStep
      />
    );

    fillDetailsStep();

    await waitFor(() => {
      expect(
        screen.getByText("Vas a continuar al pago seguro de la suscripción")
      ).toBeDefined();
    });

    expect(screen.getByText("Finalizá la suscripción")).toBeDefined();
  });
});
