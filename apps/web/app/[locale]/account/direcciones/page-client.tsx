"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddressesPanel,
  AddressFormSection,
  type AddressFormValues,
  type CustomerAddressSummary,
} from "@repo/design-system/components/addresses";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

type FormMode = "create" | "edit";

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

interface CustomerAddressesPageClientProps {
  initialAddresses: CustomerAddressSummary[];
  returnToHref?: string | null;
}

export function CustomerAddressesPageClient({
  initialAddresses,
  returnToHref = null,
}: CustomerAddressesPageClientProps) {
  const [addresses, setAddresses] =
    useState<CustomerAddressSummary[]>(initialAddresses);
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

  const runPendingAction = (
    addressId: string,
    action: () => Promise<void>
  ) => {
    setPendingAddressIds((current) =>
      current.includes(addressId) ? current : [...current, addressId]
    );
    const timeoutId = window.setTimeout(async () => {
      try {
        await action();
      } finally {
        setPendingAddressIds((current) =>
          current.filter((item) => item !== addressId)
        );
        pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(
          (item) => item !== timeoutId
        );
      }
    }, 450);

    pendingTimeoutsRef.current = [...pendingTimeoutsRef.current, timeoutId];
  };

  const setDefaultAddress = (addressId: string) => {
    runPendingAction(addressId, async () => {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        body: JSON.stringify({ isDefault: true }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        return;
      }

      const updatedAddress =
        (await response.json()) as CustomerAddressSummary;

      setAddresses((current) =>
        current.map((address) =>
          address.id === addressId
            ? updatedAddress
            : { ...address, isDefault: false }
        )
      );
    });
  };

  const removeAddress = (addressId: string) => {
    runPendingAction(addressId, async () => {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      setAddresses((current) =>
        current.filter((address) => address.id !== addressId)
      );

      if (editingAddressId === addressId) {
        closeForm();
      }
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const currentAddress = addresses.find(
      (address) => address.id === editingAddressId
    );
    const hasOtherDefaultAddress = addresses.some(
      (address) => address.id !== editingAddressId && address.isDefault
    );
    const shouldBeDefault =
      values.isDefault ||
      addresses.length === 0 ||
      Boolean(currentAddress?.isDefault && !hasOtherDefaultAddress);
    const payload = {
      ...values,
      isDefault: shouldBeDefault,
    };
    const endpoint =
      formMode === "edit" && editingAddressId
        ? `/api/account/addresses/${editingAddressId}`
        : "/api/account/addresses";
    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
      method: formMode === "edit" ? "PATCH" : "POST",
    });

    if (!response.ok) {
      return;
    }

    const nextAddress = (await response.json()) as CustomerAddressSummary;

    setAddresses((current) => {
      const withoutEdited = current.filter(
        (address) => address.id !== nextAddress.id
      );
      const normalized = nextAddress.isDefault
        ? withoutEdited.map((address) => ({ ...address, isDefault: false }))
        : withoutEdited;

      return formMode === "edit"
        ? current.map((address) =>
            address.id === nextAddress.id
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
        {returnToHref ? (
          <div>
            <Button asChild variant="outline">
              <Link href={returnToHref}>
                <ArrowLeft className="size-4" />
                Volver al checkout
              </Link>
            </Button>
          </div>
        ) : null}
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
