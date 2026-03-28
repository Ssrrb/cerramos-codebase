"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form"
import { Input } from "@repo/design-system/components/ui/input"
import type { ProductFieldProps } from "@repo/design-system/components/product/types"

function ProductNameField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Como lo vera el cliente en tu catalogo.",
  disabled,
  label = "Nombre",
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
              autoComplete="off"
              disabled={disabled}
              placeholder="Ej. Licuadora Oster 700W"
              {...field}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { ProductNameField }
