"use client";

import type { ProductFieldProps } from "@repo/design-system/components/product/types";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { Switch } from "@repo/design-system/components/ui/switch";
import type { FieldPath, FieldValues } from "react-hook-form";

function ProductDeliveryToggle<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Activa esta opcion si el precio ya contempla el delivery.",
  disabled,
  label = "Delivery incluido",
  name,
}: ProductFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={Boolean(field.value)}
                disabled={disabled}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ProductDeliveryToggle };
