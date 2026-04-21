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
  checkoutParaguayLocationData,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityOptions,
} from "./checkout-paraguay-locations";
import type { CheckoutLocationData } from "./types";
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
  customerAddressId: "customerAddressId",
  streetLine1: "streetLine1",
  streetLine2: "streetLine2",
  postalCode: "postalCode",
  referenceNote: "referenceNote",
  notes: "notes",
  saveAddress: "saveAddress",
  saveAsDefault: "saveAsDefault",
} as const;

function DeliveryStepHarness({
  defaultValues,
  locationData,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
  locationData?: CheckoutLocationData;
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
      customerAddressId: "",
      streetLine1: "",
      streetLine2: "",
      referenceNote: "",
      postalCode: "",
      notes: "",
      saveAddress: false,
      saveAsDefault: false,
      ...defaultValues,
    },
  });
  const values = useWatch({
    control: form.control,
  });

  return (
    <>
      <CheckoutDeliveryStepSection
        control={form.control}
        locationData={locationData}
        names={names}
      />
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
      customerAddressId: "",
      streetLine1: "",
      streetLine2: "",
      referenceNote: "",
      postalCode: "",
      notes: "",
      saveAddress: false,
      saveAsDefault: false,
    },
  });

  return <CheckoutDeliverySection control={form.control} names={names} />;
}

const multipleCountryLocationData: CheckoutLocationData = {
  cities: [
    {
      label: "Asunción",
      stateId: "state_db_asuncion",
      value: "city_db_asuncion",
    },
    {
      label: "Recoleta",
      stateId: "state_db_buenos_aires",
      value: "city_db_recoleta",
    },
  ],
  countries: [
    {
      label: "Argentina",
      value: "country_db_ar",
    },
    {
      label: "Paraguay",
      value: "country_db_py",
    },
  ],
  states: [
    {
      countryId: "country_db_ar",
      label: "Buenos Aires",
      value: "state_db_buenos_aires",
    },
    {
      countryId: "country_db_py",
      label: "Asunción",
      value: "state_db_asuncion",
    },
  ],
};

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

  test("uses the provided DB-backed location data instead of the static Paraguay fallback", async () => {
    render(
      <DeliveryStepHarness
        defaultValues={{
          countryId: "country_db_ar",
          stateId: "state_db_buenos_aires",
          cityId: "city_db_recoleta",
        }}
        locationData={multipleCountryLocationData}
      />
    );

    expect(checkoutParaguayLocationData.countries[0]?.value).toBe("country_py");

    expect(screen.getByLabelText("País").textContent).toContain("Argentina");
    expect(screen.getByLabelText("Departamento").textContent).toContain(
      "Buenos Aires"
    );
    expect(screen.getByLabelText("Ciudad").textContent).toContain("Recoleta");

    fireEvent.click(screen.getByRole("button", { name: "set-state-asuncion" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-city").textContent).toBe("");
    });
  });
});
