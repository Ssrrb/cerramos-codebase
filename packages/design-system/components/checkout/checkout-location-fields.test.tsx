// @vitest-environment jsdom

import { useForm, useWatch } from "react-hook-form";
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
import { CheckoutDeliverySection } from "./checkout-delivery-section";
import { CheckoutDeliveryStepSection } from "./checkout-delivery-step-section";
import {
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityOptions,
} from "./checkout-paraguay-locations";
import type { CheckoutDeliveryValues } from "./types";

const centralStateOption = checkoutParaguayStateOptions.find(
  (option) => option.label === "Central"
);
const asuncionStateOption = checkoutParaguayStateOptions.find(
  (option) => option.label === "Asunción"
);
const sanLorenzoCityOption = getCheckoutParaguayCityOptions(
  centralStateOption?.value
).find((option) => option.label === "San Lorenzo");
const asuncionCityOption = getCheckoutParaguayCityOptions(
  asuncionStateOption?.value
).find((option) => option.label === "Asunción");

const names = {
  recipientName: "recipientName",
  email: "email",
  phone: "phone",
  mode: "mode",
  countryId: "countryId",
  stateId: "stateId",
  cityId: "cityId",
  streetLine1: "streetLine1",
  streetLine2: "streetLine2",
  referenceNote: "referenceNote",
  notes: "notes",
} as const;

function DeliveryStepHarness({
  defaultValues,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
}) {
  const form = useForm<CheckoutDeliveryValues>({
    defaultValues: {
      recipientName: "",
      email: "",
      phone: "",
      mode: "delivery",
      countryId: checkoutParaguayCountryOption.value,
      stateId: "",
      cityId: "",
      streetLine1: "",
      streetLine2: "",
      referenceNote: "",
      postalCode: "",
      notes: "",
      ...defaultValues,
    },
  });
  const values = useWatch({
    control: form.control,
  });

  return (
    <>
      <CheckoutDeliveryStepSection control={form.control} names={names} />
      <button
        onClick={() => form.setValue("stateId", centralStateOption?.value ?? "")}
        type="button"
      >
        set-state-central
      </button>
      <button
        onClick={() =>
          form.setValue("stateId", asuncionStateOption?.value ?? "")
        }
        type="button"
      >
        set-state-asuncion
      </button>
      <button
        onClick={() => form.setValue("cityId", sanLorenzoCityOption?.value ?? "")}
        type="button"
      >
        set-city-san-lorenzo
      </button>
      <output data-testid="selected-state">{values.stateId ?? ""}</output>
      <output data-testid="selected-city">{values.cityId ?? ""}</output>
    </>
  );
}

function DeliverySectionHarness() {
  const form = useForm<CheckoutDeliveryValues>({
    defaultValues: {
      recipientName: "",
      email: "",
      phone: "",
      mode: "delivery",
      countryId: checkoutParaguayCountryOption.value,
      stateId: "",
      cityId: "",
      streetLine1: "",
      streetLine2: "",
      referenceNote: "",
      postalCode: "",
      notes: "",
    },
  });

  return <CheckoutDeliverySection control={form.control} names={names} />;
}

describe("checkout location fields", () => {
  beforeAll(() => {
    if (!("hasPointerCapture" in Element.prototype)) {
      Object.defineProperty(Element.prototype, "hasPointerCapture", {
        configurable: true,
        value: () => false,
      });
    }

    if (!("releasePointerCapture" in Element.prototype)) {
      Object.defineProperty(Element.prototype, "releasePointerCapture", {
        configurable: true,
        value: () => undefined,
      });
    }

    if (!("setPointerCapture" in Element.prototype)) {
      Object.defineProperty(Element.prototype, "setPointerCapture", {
        configurable: true,
        value: () => undefined,
      });
    }
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("exposes Paraguay state options and keeps city disabled until a state is selected", () => {
    render(<DeliveryStepHarness />);

    expect(checkoutParaguayCountryOption.label).toBe("Paraguay");
    expect(
      checkoutParaguayStateOptions.find((option) => option.label === "Asunción")
    ).toBeDefined();
    expect(
      checkoutParaguayStateOptions.find((option) => option.label === "Central")
    ).toBeDefined();

    expect(screen.getByLabelText("País").textContent).toContain("Paraguay");
    const cityTrigger = screen.getByLabelText("Ciudad");
    expect(cityTrigger.getAttribute("data-disabled")).not.toBeNull();
  });

  test("filters city options by state and resets city when the state changes", async () => {
    render(<DeliveryStepHarness />);

    fireEvent.click(screen.getByRole("button", { name: "set-state-central" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-state").textContent).toBe(
        centralStateOption?.value ?? ""
      );
    });

    expect(screen.getByLabelText("Departamento").textContent).toContain(
      "Central"
    );
    expect(screen.getByLabelText("Ciudad").textContent).toContain(
      "Seleccioná una ciudad"
    );

    fireEvent.click(
      screen.getByRole("button", { name: "set-city-san-lorenzo" })
    );

    await waitFor(() => {
      expect(screen.getByTestId("selected-city").textContent).toBe(
        sanLorenzoCityOption?.value ?? ""
      );
    });

    expect(screen.getByLabelText("Ciudad").textContent).toContain(
      "San Lorenzo"
    );

    fireEvent.click(screen.getByRole("button", { name: "set-state-asuncion" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-state").textContent).toBe(
        asuncionStateOption?.value ?? ""
      );
      expect(screen.getByTestId("selected-city").textContent).toBe("");
    });

    expect(screen.getByLabelText("Departamento").textContent).toContain(
      "Asunción"
    );
    expect(screen.getByLabelText("Ciudad").textContent).toContain(
      "Seleccioná una ciudad"
    );
    expect(asuncionCityOption?.label).toBe("Asunción");
  });

  test("renders the same normalized location fields in the section checkout surface", () => {
    render(<DeliverySectionHarness />);

    expect(screen.getByLabelText("País")).toBeDefined();
    expect(screen.getByLabelText("Departamento")).toBeDefined();
    expect(screen.getByLabelText("Ciudad")).toBeDefined();
    expect(screen.getByLabelText("Complemento")).toBeDefined();
  });
});
