"use client";

import {
  CheckoutCheckboxField,
  CheckoutInputField,
} from "@repo/design-system/components/checkout/checkout-form-fields";
import { CheckoutLocationFields } from "@repo/design-system/components/checkout/checkout-location-fields";
import { checkoutParaguayLocationData } from "@repo/design-system/components/checkout/checkout-paraguay-locations";
import type { CheckoutDeliveryFieldNames } from "@repo/design-system/components/checkout/checkout-form-fields";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { FieldGroup } from "@repo/design-system/components/ui/field";
import { cn } from "@repo/design-system/lib/utils";
import type { FieldValues } from "react-hook-form";
import type { AddressFormSectionProps } from "./types";

function createLocationFieldNames<TFieldValues extends FieldValues>(
  names: AddressFormSectionProps<TFieldValues>["names"]
) {
  return {
    cityId: names.cityId,
    countryId: names.countryId,
    customerAddressId: names.label,
    email: names.label,
    mode: names.label,
    notes: names.label,
    phone: names.phone,
    postalCode: names.postalCode,
    referenceNote: names.referenceNote,
    recipientName: names.recipientName,
    saveAddress: names.isDefault,
    saveAsDefault: names.isDefault,
    stateId: names.stateId,
    streetLine1: names.streetLine1,
    streetLine2: names.streetLine2,
  } as unknown as CheckoutDeliveryFieldNames<TFieldValues>;
}

export function AddressFormSection<TFieldValues extends FieldValues>({
  actions,
  className,
  control,
  description = "Completá los datos que necesitás para reutilizar esta dirección en futuros pedidos.",
  disabled,
  footer,
  locationData = checkoutParaguayLocationData,
  mode = "create",
  names,
  title,
}: AddressFormSectionProps<TFieldValues>) {
  const resolvedTitle =
    title ?? (mode === "edit" ? "Editar dirección" : "Agregar dirección");
  const locationNames = createLocationFieldNames(names);

  return (
    <Card
      className={cn(
        "gap-0 rounded-[1.75rem] border-border/70 py-0 shadow-xs",
        className
      )}
    >
      <CardHeader className="gap-2 border-b border-border/70 px-5 py-5 sm:px-6">
        <p className="text-muted-foreground text-sm">Direcciones</p>
        <CardTitle className="text-xl">{resolvedTitle}</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardHeader>
      <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInputField
              control={control}
              description="Etiqueta interna para reconocer rápido esta dirección."
              disabled={disabled}
              label="Etiqueta"
              name={names.label}
              placeholder="Casa, oficina, depósito"
            />
            <CheckoutInputField
              control={control}
              disabled={disabled}
              label="Nombre de contacto"
              name={names.recipientName}
              placeholder="Sebastián Rojas"
              rules={{
                required: "Ingresá el nombre de contacto.",
              }}
            />
          </div>
          <CheckoutInputField
            control={control}
            disabled={disabled}
            inputMode="tel"
            label="Teléfono"
            name={names.phone}
            placeholder="0982 403 532"
            rules={{
              required: "Ingresá un teléfono de contacto.",
            }}
          />
          <CheckoutLocationFields
            control={control}
            disabled={disabled}
            locationData={locationData}
            names={locationNames}
            requiredCityMessage="Indicá la ciudad de esta dirección."
          />
          <CheckoutInputField
            autoComplete="street-address"
            control={control}
            disabled={disabled}
            label="Dirección"
            name={names.streetLine1}
            placeholder="Camino de la Torre 618"
            rules={{
              required: "Ingresá la dirección principal.",
            }}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInputField
              control={control}
              description="Opcional. Si tu zona lo usa, ayuda a la mensajería."
              disabled={disabled}
              label="Código postal"
              name={names.postalCode}
              placeholder="2309"
            />
            <CheckoutInputField
              control={control}
              description="Indicaciones para encontrar el punto de entrega."
              disabled={disabled}
              label="Referencia"
              name={names.referenceNote}
              placeholder="Portón gris, casa del fondo"
            />
          </div>
          <CheckoutCheckboxField
            control={control}
            description="La vamos a priorizar automáticamente cuando exista una selección rápida de direcciones."
            disabled={disabled}
            label="Usar como dirección predeterminada"
            name={names.isDefault}
          />
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 border-t border-border/70 px-5 py-5 sm:px-6">
        {footer ? (
          footer
        ) : (
          <p className="text-muted-foreground text-sm leading-relaxed">
            Guardá solo la información que realmente acelera la próxima compra.
          </p>
        )}
        {actions ? (
          <div className="flex flex-wrap justify-end gap-3">{actions}</div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
