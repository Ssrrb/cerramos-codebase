"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { FieldGroup } from "@repo/design-system/components/ui/field";
import { cn } from "@repo/design-system/lib/utils";
import type { Control, FieldValues } from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  type CheckoutDeliveryFieldNames,
  CheckoutCheckboxField,
  CheckoutDeliveryModeField,
  CheckoutInputField,
  CheckoutSelectField,
  CheckoutTextareaField,
} from "./checkout-form-fields";
import { CheckoutLocationFields } from "./checkout-location-fields";
import type {
  CheckoutDeliveryMode,
  CheckoutLocationData,
  CheckoutSavedAddress,
} from "./types";

interface CheckoutDeliveryStepSectionProps<TFieldValues extends FieldValues> {
  allowSavedAddresses?: boolean;
  canSaveNewAddress?: boolean;
  className?: string;
  control: Control<TFieldValues>;
  deliveryEnabled?: boolean;
  disabled?: boolean;
  locationData?: CheckoutLocationData;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
  pickupEnabled?: boolean;
  savedAddresses?: CheckoutSavedAddress[];
}

function CheckoutDeliveryStepSection<TFieldValues extends FieldValues>({
  allowSavedAddresses = false,
  canSaveNewAddress = false,
  className,
  control,
  deliveryEnabled = true,
  disabled,
  locationData,
  names,
  pickupEnabled = true,
  savedAddresses = [],
}: CheckoutDeliveryStepSectionProps<TFieldValues>) {
  const deliveryMode = useWatch({
    control,
    name: names.mode,
  }) as CheckoutDeliveryMode | undefined;

  const isDelivery = (deliveryMode ?? "delivery") === "delivery";
  const hasMultipleSavedAddresses = savedAddresses.length > 1;
  const canShowSaveAddress = canSaveNewAddress || allowSavedAddresses;

  return (
    <Card
      className={cn(
        "gap-0 rounded-[1.75rem] border-border/70 shadow-xs",
        className
      )}
    >
      <CardHeader className="gap-1.5 px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
        <CardDescription>Entrega</CardDescription>
        <CardTitle className="text-base">
          Cómo querés recibir este pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
        <FieldGroup>
          <CheckoutDeliveryModeField
            control={control}
            deliveryEnabled={deliveryEnabled}
            disabled={disabled}
            name={names.mode}
            pickupEnabled={pickupEnabled}
            rules={{
              required: "Elegí cómo querés recibir el pedido.",
            }}
          />
          {isDelivery ? (
            <>
              {allowSavedAddresses && hasMultipleSavedAddresses ? (
                <CheckoutSelectField
                  control={control}
                  description="Podés elegir una dirección guardada o editar los campos."
                  disabled={disabled}
                  label="Dirección guardada"
                  name={names.customerAddressId}
                  options={savedAddresses.map((address) => ({
                    label: `Dirección: ${address.summary}`,
                    value: address.id,
                  }))}
                  placeholder="Elegí una dirección"
                />
              ) : null}
              <CheckoutLocationFields
                control={control}
                disabled={disabled}
                locationData={locationData}
                names={names}
                requiredCityMessage="Indicá la ciudad de entrega."
              />
              <CheckoutInputField
                autoComplete="street-address"
                control={control}
                disabled={disabled}
                label="Dirección"
                name={names.streetLine1}
                placeholder="Av. España 742 casi Perú"
                rules={{
                  required: "Ingresá la dirección de entrega.",
                }}
              />
              <CheckoutInputField
                control={control}
                description="Punto de referencia para encontrar la entrega más fácil."
                disabled={disabled}
                label="Referencia"
                name={names.referenceNote}
                placeholder="Portón negro frente a la farmacia"
              />
              <CheckoutInputField
                control={control}
                disabled={disabled}
                label="Codigo Postal"
                name={names.postalCode}
                placeholder="1000"
              />
            </>
          ) : (
            <div className="rounded-[1.25rem] border border-border/70 border-dashed bg-muted/20 px-4 py-3">
              <p className="font-medium text-foreground text-sm">
                Retiro en local
              </p>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                No necesitás completar dirección. El comercio usará tu contacto
                para coordinar horario y punto de retiro.
              </p>
            </div>
          )}
          <CheckoutTextareaField
            control={control}
            description="Opcional. Indicaciones extra para preparación, retiro o entrega."
            disabled={disabled}
            label="Notas"
            name={names.notes}
            placeholder="Torre 2, Dpto 204."
          />
          {isDelivery && canShowSaveAddress ? (
            <div className="rounded-[1.25rem] border border-border/70 bg-muted/15 px-4 py-4">
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">
                  Guardar esta dirección
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Esta preferencia se aplica cuando confirmás el pedido, para no
                  interrumpir la carga de la entrega.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <CheckoutCheckboxField
                  control={control}
                  description="Solo la guardaremos si confirmás el pedido con esta opción activa."
                  disabled={disabled}
                  label="Guardar esta dirección en mi cuenta"
                  name={names.saveAddress}
                />
                <CheckoutCheckboxField
                  control={control}
                  description="La vamos a priorizar automáticamente en tu próximo checkout."
                  disabled={disabled}
                  label="Usar como dirección predeterminada"
                  name={names.saveAsDefault}
                />
              </div>
            </div>
          ) : null}
        </FieldGroup>
      </CardContent>
      <CardFooter className="border-border/70 border-t px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Completá solo los datos necesarios para esta entrega.
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutDeliveryStepSection };
