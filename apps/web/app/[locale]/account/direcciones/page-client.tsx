"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddressesPanel,
  AddressFormSection,
  type AddressFormValues,
  type CustomerAddressSummary,
} from "@repo/design-system/components/addresses";
import {
  getCheckoutParaguayCityName,
  getCheckoutParaguayStateName,
} from "@repo/design-system/components/checkout/checkout-paraguay-locations";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addressFormSchema = z.object({
  cityId: z.string().trim().min(1, "Indicá la ciudad de esta dirección."),
  countryId: z.string().trim().min(1),
  isDefault: z.boolean(),
  label: z.string().trim(),
  phone: z.string().trim().min(1, "Ingresá un teléfono de contacto."),
  postalCode: z.string().trim(),
  recipientName: z.string().trim().min(1, "Ingresá el nombre de contacto."),
  referenceNote: z.string().trim(),
  stateId: z
    .string()
    .trim()
    .min(1, "Indicá el departamento de esta dirección."),
  streetLine1: z.string().trim().min(1, "Ingresá la dirección principal."),
  streetLine2: z.string().trim(),
});

const defaultValues: AddressFormValues = {
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
};

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

const sampleAddresses: CustomerAddressSummary[] = [
  {
    cityId: "city_py_11_fernando_de_la_mora",
    countryId: "country_py",
    id: "address_home",
    isDefault: true,
    label: "Casa",
    phone: "0982 403 532",
    postalCode: "2309",
    recipientName: "Sebas Rojas",
    referenceNote: "Portón gris frente al surtidor.",
    stateId: "state_py_11",
    streetLine1: "Camino de la Torre 618",
    streetLine2: "Sabanera Dorado",
    summary: "Fernando de la Mora, Central",
  },
  {
    cityId: "city_py_asu_asuncion",
    countryId: "country_py",
    id: "address_office",
    isDefault: false,
    label: "Oficina",
    phone: "0971 222 111",
    postalCode: "",
    recipientName: "Sebas Rojas",
    referenceNote: "Recepción del piso 4.",
    stateId: "state_py_asu",
    streetLine1: "Aviadores del Chaco 2450",
    streetLine2: "World Trade Center, Torre 3",
    summary: "Asunción",
  },
  {
    cityId: "city_py_11_luque",
    countryId: "country_py",
    id: "address_family",
    isDefault: false,
    label: "Familia",
    phone: "0991 888 222",
    postalCode: "",
    recipientName: "Sebastián Rojas",
    referenceNote: "",
    stateId: "state_py_11",
    streetLine1: "Paraje Ambay",
    streetLine2: "San Antonio",
    summary: "Luque, Central",
  },
];

type FormMode = "create" | "edit";

const createAddressSummary = ({
  cityId,
  stateId,
}: Pick<AddressFormValues, "cityId" | "stateId">) => {
  const cityName = getCheckoutParaguayCityName(cityId);
  const stateName = getCheckoutParaguayStateName(stateId);

  return [cityName, stateName].filter(Boolean).join(", ") || "Paraguay";
};

const toFormValues = (address: CustomerAddressSummary): AddressFormValues => ({
  cityId: address.cityId,
  countryId: address.countryId,
  isDefault: address.isDefault,
  label: address.label ?? "",
  phone: address.phone ?? "",
  postalCode: address.postalCode ?? "",
  recipientName: address.recipientName ?? "",
  referenceNote: address.referenceNote ?? "",
  stateId: address.stateId,
  streetLine1: address.streetLine1,
  streetLine2: address.streetLine2 ?? "",
});

const toAddressSummary = (
  values: AddressFormValues,
  id: string
): CustomerAddressSummary => ({
  cityId: values.cityId,
  countryId: values.countryId,
  id,
  isDefault: values.isDefault,
  label: values.label,
  phone: values.phone,
  postalCode: values.postalCode,
  recipientName: values.recipientName,
  referenceNote: values.referenceNote,
  stateId: values.stateId,
  streetLine1: values.streetLine1,
  streetLine2: values.streetLine2,
  summary: createAddressSummary(values),
});

export function CustomerAddressesPageClient() {
  const [addresses, setAddresses] =
    useState<CustomerAddressSummary[]>(sampleAddresses);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [pendingAddressIds, setPendingAddressIds] = useState<string[]>([]);
  const pendingTimeoutsRef = useRef<number[]>([]);

  const form = useForm<AddressFormValues>({
    defaultValues,
    resolver: zodResolver(addressFormSchema) as Resolver<AddressFormValues>,
  });

  useEffect(() => {
    return () => {
      for (const timeoutId of pendingTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setFormMode("create");
    setEditingAddressId(null);
    form.reset(defaultValues);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingAddressId(null);
    form.reset({
      ...defaultValues,
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addressId: string) => {
    const address = addresses.find((item) => item.id === addressId);

    if (!address) {
      return;
    }

    setFormMode("edit");
    setEditingAddressId(addressId);
    form.reset(toFormValues(address));
    setIsFormOpen(true);
  };

  const runPendingAction = (addressId: string, action: () => void) => {
    setPendingAddressIds((current) =>
      current.includes(addressId) ? current : [...current, addressId]
    );
    const timeoutId = window.setTimeout(() => {
      action();
      setPendingAddressIds((current) =>
        current.filter((item) => item !== addressId)
      );
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(
        (item) => item !== timeoutId
      );
    }, 450);

    pendingTimeoutsRef.current = [...pendingTimeoutsRef.current, timeoutId];
  };

  const setDefaultAddress = (addressId: string) => {
    runPendingAction(addressId, () => {
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        }))
      );
    });
  };

  const removeAddress = (addressId: string) => {
    runPendingAction(addressId, () => {
      setAddresses((current) => {
        const next = current.filter((address) => address.id !== addressId);

        if (next.some((address) => address.isDefault) || next.length === 0) {
          return next;
        }

        return next.map((address, index) => ({
          ...address,
          isDefault: index === 0,
        }));
      });

      if (editingAddressId === addressId) {
        closeForm();
      }
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    const nextId = editingAddressId ?? `address_${Date.now()}`;
    const currentAddress = addresses.find((address) => address.id === nextId);
    const hasOtherDefaultAddress = addresses.some(
      (address) => address.id !== nextId && address.isDefault
    );
    const shouldBeDefault =
      values.isDefault ||
      addresses.length === 0 ||
      Boolean(currentAddress?.isDefault && !hasOtherDefaultAddress);
    const nextAddress = toAddressSummary(
      {
        ...values,
        isDefault: shouldBeDefault,
      },
      nextId
    );

    setAddresses((current) => {
      const withoutEdited = current.filter((address) => address.id !== nextId);
      const normalized = nextAddress.isDefault
        ? withoutEdited.map((address) => ({ ...address, isDefault: false }))
        : withoutEdited;

      return formMode === "edit"
        ? current.map((address) =>
            address.id === nextId
              ? nextAddress
              : {
                  ...address,
                  isDefault: nextAddress.isDefault ? false : address.isDefault,
                }
          )
        : [nextAddress, ...normalized];
    });

    closeForm();
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-12">
      <div className="space-y-8">
        <AddressesPanel
          addresses={addresses}
          onAddAddress={openCreateForm}
          onEditAddress={openEditForm}
          onRemoveAddress={removeAddress}
          onSetDefaultAddress={setDefaultAddress}
          pendingAddressIds={pendingAddressIds}
        />
        {isFormOpen ? (
          <Form {...form}>
            <form onSubmit={handleSubmit}>
              <AddressFormSection
                actions={
                  <>
                    <Button onClick={closeForm} type="button" variant="ghost">
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {formMode === "edit"
                        ? "Guardar cambios"
                        : "Guardar dirección"}
                    </Button>
                  </>
                }
                control={form.control}
                mode={formMode}
                names={formNames}
              />
            </form>
          </Form>
        ) : null}
      </div>
    </main>
  );
}
