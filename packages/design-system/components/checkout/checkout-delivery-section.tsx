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
  CheckoutDeliveryModeField,
  CheckoutInputField,
  CheckoutTextareaField,
} from "./checkout-form-fields";
import type { CheckoutDeliveryMode } from "./types";

interface CheckoutDeliverySectionProps<TFieldValues extends FieldValues> {
  className?: string;
  control: Control<TFieldValues>;
  disabled?: boolean;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
}

function CheckoutDeliverySection<TFieldValues extends FieldValues>({
  className,
  control,
  disabled,
  names,
}: CheckoutDeliverySectionProps<TFieldValues>) {
  const deliveryMode = useWatch({
    control,
    name: names.mode,
  }) as CheckoutDeliveryMode | undefined;

  const isDelivery = (deliveryMode ?? "delivery") === "delivery";

  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Entrega</CardDescription>
        <CardTitle className="text-base">
          Datos para coordinar el pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup>
          <CheckoutDeliveryModeField
            control={control}
            disabled={disabled}
            name={names.mode}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInputField
              autoComplete="name"
              control={control}
              disabled={disabled}
              label="Nombre y apellido"
              name={names.recipientName}
              placeholder="Ej. Camila Ferreira"
            />
            <CheckoutInputField
              autoComplete="tel"
              control={control}
              disabled={disabled}
              inputMode="tel"
              label="Teléfono"
              name={names.phone}
              placeholder="0981 123 456"
              type="tel"
            />
          </div>
          <CheckoutInputField
            autoComplete="email"
            control={control}
            disabled={disabled}
            inputMode="email"
            label="Email"
            name={names.email}
            placeholder="vos@ejemplo.com"
            type="email"
          />
          {isDelivery ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <CheckoutInputField
                  control={control}
                  disabled={disabled}
                  label="Ciudad"
                  name={names.city}
                  placeholder="Asunción"
                />
                <CheckoutInputField
                  control={control}
                  description="Opcional, útil para edificio, piso o barrio."
                  disabled={disabled}
                  label="Complemento"
                  name={names.addressLine2}
                  placeholder="Torre 2, piso 4"
                />
              </div>
              <CheckoutInputField
                autoComplete="street-address"
                control={control}
                disabled={disabled}
                label="Dirección"
                name={names.addressLine1}
                placeholder="Av. España 742 casi Perú"
              />
              <CheckoutInputField
                control={control}
                description="Punto de referencia para encontrar la entrega más fácil."
                disabled={disabled}
                label="Referencia"
                name={names.reference}
                placeholder="Portón negro frente a la farmacia"
              />
            </>
          ) : null}
          <CheckoutTextareaField
            control={control}
            description="Opcional. Indicaciones extra para preparación, retiro o entrega."
            disabled={disabled}
            label="Notas"
            name={names.notes}
            placeholder="Si no atiendo, escribime por WhatsApp."
          />
        </FieldGroup>
      </CardContent>
      <CardFooter className="border-border/70 border-t pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Usaremos estos datos solo para coordinar este pedido dentro de
          Paraguay.
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutDeliverySection };
export type { CheckoutDeliveryFieldNames } from "./checkout-form-fields";
