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
  CheckoutDeliveryModeField,
  CheckoutInputField,
  CheckoutTextareaField,
} from "./checkout-form-fields";
import type { CheckoutDeliveryMode } from "./types";

interface CheckoutDeliveryStepSectionProps<TFieldValues extends FieldValues> {
  className?: string;
  control: Control<TFieldValues>;
  disabled?: boolean;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
}

function CheckoutDeliveryStepSection<TFieldValues extends FieldValues>({
  className,
  control,
  disabled,
  names,
}: CheckoutDeliveryStepSectionProps<TFieldValues>) {
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
          Cómo querés recibir este pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup>
          <CheckoutDeliveryModeField
            control={control}
            disabled={disabled}
            name={names.mode}
            rules={{
              required: "Elegí cómo querés recibir el pedido.",
            }}
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
                  rules={{
                    required: "Indicá la ciudad de entrega.",
                  }}
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
                rules={{
                  required: "Ingresá la dirección de entrega.",
                }}
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
            placeholder="Si no atiendo, escribime por WhatsApp."
          />
        </FieldGroup>
      </CardContent>
      <CardFooter className="border-border/70 border-t pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Mostramos solo los campos necesarios para esta modalidad.
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutDeliveryStepSection };
