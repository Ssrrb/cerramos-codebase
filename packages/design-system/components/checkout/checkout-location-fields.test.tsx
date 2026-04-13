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
import { checkoutParaguayCityOptions } from "./checkout-paraguay-locations";
import type { CheckoutDeliveryValues } from "./types";

const names = {
  recipientName: "recipientName",
  email: "email",
  phone: "phone",
  mode: "mode",
  city: "city",
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  reference: "reference",
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
      city: "",
      addressLine1: "",
      addressLine2: "",
      reference: "",
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
      <button onClick={() => form.setValue("city", "Asunción")} type="button">
        set-city-asuncion
      </button>
      <button onClick={() => form.setValue("city", "Luque")} type="button">
        set-city-luque
      </button>
      <button
        onClick={() => form.setValue("addressLine2", "Barrio Jara")}
        type="button"
      >
        set-barrio-jara
      </button>
      <output data-testid="selected-city">{values.city ?? ""}</output>
      <output data-testid="selected-barrio">{values.addressLine2 ?? ""}</output>
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
      city: "",
      addressLine1: "",
      addressLine2: "",
      reference: "",
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

  test("exposes Paraguay city options and keeps barrio disabled until a city is selected", () => {
    render(<DeliveryStepHarness />);

    expect(
      checkoutParaguayCityOptions.find((option) => option.value === "Asunción")
    ).toBeDefined();
    expect(
      checkoutParaguayCityOptions.find(
        (option) => option.value === "Encarnación"
      )
    ).toBeDefined();
    expect(
      checkoutParaguayCityOptions.find((option) => option.value === "Luque")
    ).toBeDefined();

    const barrioTrigger = screen.getByLabelText("Barrio");
    expect(barrioTrigger.getAttribute("data-disabled")).not.toBeNull();
  });

  test("filters barrio options by city and resets barrio when the city changes", async () => {
    render(<DeliveryStepHarness />);

    fireEvent.click(screen.getByRole("button", { name: "set-city-asuncion" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-city").textContent).toBe("Asunción");
    });

    expect(screen.getByLabelText("Ciudad").textContent).toContain("Asunción");
    expect(screen.getByLabelText("Barrio").textContent).toContain(
      "Seleccioná un barrio"
    );

    fireEvent.click(screen.getByRole("button", { name: "set-barrio-jara" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-barrio").textContent).toBe(
        "Barrio Jara"
      );
    });

    expect(screen.getByLabelText("Barrio").textContent).toContain(
      "Barrio Jara"
    );

    fireEvent.click(screen.getByRole("button", { name: "set-city-luque" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-city").textContent).toBe("Luque");
      expect(screen.getByTestId("selected-barrio").textContent).toBe("");
    });

    expect(screen.getByLabelText("Ciudad").textContent).toContain("Luque");
    expect(screen.getByLabelText("Barrio").textContent).toContain(
      "Seleccioná un barrio"
    );
  });

  test("renders the same city and barrio selects in the section checkout surface", () => {
    render(<DeliverySectionHarness />);

    expect(screen.getByLabelText("Ciudad")).toBeDefined();
    const barrioTrigger = screen.getByLabelText("Barrio");
    expect(barrioTrigger).toBeDefined();
    expect(barrioTrigger.getAttribute("data-disabled")).not.toBeNull();
  });
});
