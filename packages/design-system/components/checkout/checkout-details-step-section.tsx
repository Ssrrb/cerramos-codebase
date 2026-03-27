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
import {
  type CheckoutDeliveryFieldNames,
  CheckoutInputField,
} from "./checkout-form-fields";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutDetailsStepSectionProps<TFieldValues extends FieldValues> {
  className?: string;
  control: Control<TFieldValues>;
  disabled?: boolean;
  names: CheckoutDeliveryFieldNames<TFieldValues>;
}

function CheckoutDetailsStepSection<TFieldValues extends FieldValues>({
  className,
  control,
  disabled,
  names,
}: CheckoutDetailsStepSectionProps<TFieldValues>) {
  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Mis datos</CardDescription>
        <CardTitle className="text-base">
          Te pedimos solo lo necesario para contactarte
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <FieldGroup>
          <CheckoutInputField
            autoComplete="name"
            control={control}
            disabled={disabled}
            label="Nombre y apellido"
            name={names.recipientName}
            placeholder="Ej. Camila Ferreira"
            rules={{
              required: "Ingresá tu nombre y apellido.",
              minLength: {
                value: 3,
                message: "Usá al menos 3 caracteres.",
              },
            }}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckoutInputField
              autoComplete="email"
              control={control}
              disabled={disabled}
              inputMode="email"
              label="Email"
              name={names.email}
              placeholder="vos@ejemplo.com"
              rules={{
                required: "Ingresá un email válido.",
                pattern: {
                  value: emailPattern,
                  message: "Revisá el formato del email.",
                },
              }}
              type="email"
            />
            <CheckoutInputField
              autoComplete="tel"
              control={control}
              disabled={disabled}
              inputMode="tel"
              label="Teléfono"
              name={names.phone}
              placeholder="0981 123 456"
              rules={{
                required: "Ingresá un teléfono de contacto.",
                minLength: {
                  value: 8,
                  message: "El teléfono parece incompleto.",
                },
              }}
              type="tel"
            />
          </div>
        </FieldGroup>
      </CardContent>
      <CardFooter className="border-border/70 border-t pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Usaremos estos datos solo para coordinar este pedido.
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutDetailsStepSection };
