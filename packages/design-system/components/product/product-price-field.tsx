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
import { Input } from "@repo/design-system/components/ui/input";
import type { FieldPath, FieldValues } from "react-hook-form";

function ProductPriceField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Precio base del producto en guaranies.",
  disabled,
  label = "Precio",
  name,
}: ProductFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              disabled={disabled}
              min={0}
              onChange={(event) => {
                const nextValue = event.target.value;

                field.onChange(
                  nextValue === "" ? 0 : event.target.valueAsNumber
                );
              }}
              placeholder="0"
              step={1}
              type="number"
              value={
                typeof field.value === "number" && Number.isNaN(field.value)
                  ? 0
                  : (field.value ?? 0)
              }
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ProductPriceField };
