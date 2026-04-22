"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/design-system/components/ui/radio-group";
import { cn } from "@repo/design-system/lib/utils";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

interface ProductDeliveryIncludedFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  isService?: boolean;
  name: TName;
}

const deliveryIncludedOptions = [
  {
    description:
      "El checkout puede pedir datos de entrega y dejar visible la logística desde el inicio.",
    title: "Sí, coordino entrega",
    value: "true",
  },
  {
    description:
      "Ideal cuando la entrega no aplica o se resuelve fuera del checkout, por ejemplo en servicios online.",
    title: "No, no hace falta",
    value: "false",
  },
] as const;

function ProductDeliveryIncludedField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  disabled,
  isService = false,
  name,
}: ProductDeliveryIncludedFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <div className="space-y-1">
            <FormLabel>¿Necesitas coordinar la entrega?</FormLabel>
            <FormDescription>
              {isService
                ? "Para servicios, esta decisión define si el checkout debe mostrar datos de logística por defecto."
                : "Definí si esta oferta necesita coordinación de entrega dentro del checkout."}
            </FormDescription>
          </div>
          <FormControl>
            <RadioGroup
              className="grid gap-3 md:grid-cols-2"
              onValueChange={(value) => field.onChange(value === "true")}
              value={field.value ? "true" : "false"}
            >
              {deliveryIncludedOptions.map((option) => {
                const itemId = `${String(name)}-${option.value}`;
                const isSelected =
                  String(Boolean(field.value)) === option.value;

                return (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background hover:border-foreground/20",
                      disabled ? "pointer-events-none opacity-60" : ""
                    )}
                    htmlFor={itemId}
                    key={option.value}
                  >
                    <RadioGroupItem
                      className={cn(
                        "mt-0.5",
                        isSelected
                          ? "border-background text-background"
                          : "border-border/80 text-primary"
                      )}
                      disabled={disabled}
                      id={itemId}
                      value={option.value}
                    />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{option.title}</div>
                      <div
                        className={cn(
                          "text-sm leading-relaxed",
                          isSelected
                            ? "text-background/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ProductDeliveryIncludedField };
