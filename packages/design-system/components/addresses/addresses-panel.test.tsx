// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { useForm } from "react-hook-form";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { AddressAddTile } from "./address-add-tile";
import { AddressCard } from "./address-card";
import { AddressFormSection } from "./address-form-section";
import { AddressesPanel } from "./addresses-panel";
import type { AddressFormValues, CustomerAddressSummary } from "./types";

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  }
});

const addresses: CustomerAddressSummary[] = [
  {
    cityId: "city_py_san_lorenzo",
    countryId: "country_py",
    id: "address_home",
    isDefault: true,
    label: "Casa",
    phone: "0982 403 532",
    postalCode: "2309",
    recipientName: "Sebas Rojas",
    referenceNote: "Portón gris frente al surtidor.",
    stateId: "state_py_central",
    streetLine1: "Camino de la Torre 618",
    streetLine2: "Barrio Sabanera Dorado",
    summary: "Fernando de la Mora, Central",
  },
  {
    cityId: "city_py_asuncion",
    countryId: "country_py",
    id: "address_work",
    isDefault: false,
    label: "Oficina",
    phone: "0971 222 111",
    postalCode: "",
    recipientName: "Sebas Rojas",
    referenceNote: "",
    stateId: "state_py_capital",
    streetLine1: "Aviadores del Chaco 2450",
    streetLine2: "Piso 4",
    summary: "Asunción",
  },
];

const formNames = {
  cityId: "cityId",
  countryId: "countryId",
  isDefault: "isDefault",
  label: "label",
  phone: "phone",
  postalCode: "postalCode",
  recipientName: "recipientName",
  referenceNote: "referenceNote",
  stateId: "stateId",
  streetLine1: "streetLine1",
  streetLine2: "streetLine2",
} as const;

function AddressFormHarness({
  defaultValues,
}: {
  defaultValues?: Partial<AddressFormValues>;
}) {
  const form = useForm<AddressFormValues>({
    defaultValues: {
      cityId: "",
      countryId: "country_py",
      isDefault: false,
      label: "",
      phone: "",
      postalCode: "",
      recipientName: "",
      referenceNote: "",
      stateId: "",
      streetLine1: "",
      streetLine2: "",
      ...defaultValues,
    },
    mode: "onSubmit",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)}>
        <AddressFormSection
          actions={
            <Button type="submit" variant="default">
              Guardar dirección
            </Button>
          }
          control={form.control}
          names={formNames}
        />
      </form>
    </Form>
  );
}

describe("direcciones shared components", () => {
  test("address card renders default state and hides the set-default action", () => {
    render(<AddressCard address={addresses[0]} />);

    expect(screen.getByText("Predeterminada")).toBeTruthy();
    expect(screen.queryByText("Usar como predeterminada")).toBeNull();
    expect(screen.getByText("Sebas Rojas")).toBeTruthy();
  });

  test("address card shows set-default action for non-default addresses", () => {
    const onSetDefault = vi.fn();

    render(<AddressCard address={addresses[1]} onSetDefault={onSetDefault} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Usar como predeterminada" })
    );

    expect(onSetDefault).toHaveBeenCalledWith("address_work");
  });

  test("pending address cards replace footer actions with a busy state", () => {
    render(<AddressCard address={addresses[1]} isPending />);

    expect(screen.getByText("Actualizando dirección…")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
  });

  test("add address tile communicates the next action", () => {
    const onAdd = vi.fn();

    render(<AddressAddTile onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /Nueva dirección/i }));

    expect(screen.getByText("Agregar dirección")).toBeTruthy();
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test("addresses panel handles an empty state", () => {
    render(<AddressesPanel addresses={[]} />);

    expect(screen.getByText("Direcciones")).toBeTruthy();
    expect(
      screen.getByText(/Guardá tus puntos de entrega frecuentes/i)
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Nueva dirección/i })
    ).toBeTruthy();
  });

  test("addresses panel forwards actions for populated cards", () => {
    const onEditAddress = vi.fn();

    render(
      <AddressesPanel addresses={addresses} onEditAddress={onEditAddress} />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[1]);

    expect(onEditAddress).toHaveBeenCalledWith("address_work");
  });

  test("form keeps validation errors attached to the fields that failed", async () => {
    render(<AddressFormHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar dirección" }));

    await waitFor(() => {
      expect(screen.getByText("Ingresá el nombre de contacto.")).toBeTruthy();
    });

    expect(screen.getByText("Ingresá un teléfono de contacto.")).toBeTruthy();
    expect(
      screen.getByText("Indicá la ciudad de esta dirección.")
    ).toBeTruthy();
    expect(screen.getByText("Ingresá la dirección principal.")).toBeTruthy();
  });
});
