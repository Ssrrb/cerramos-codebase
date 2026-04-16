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
import { Textarea } from "@repo/design-system/components/ui/textarea";
import type { FieldPath, FieldValues } from "react-hook-form";

function ProductDescriptionField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Resume el beneficio principal, materiales o detalles de entrega.",
  disabled,
  label = "Descripcion",
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
            <Textarea
              className="min-h-28"
              disabled={disabled}
              placeholder="Describe que hace especial a este producto."
              {...field}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { ProductDescriptionField };
