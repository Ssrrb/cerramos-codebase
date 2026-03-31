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

function ProductStockField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Cantidad disponible para vender ahora.",
  disabled,
  label = "Stock",
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
                const nextValue = event.target.value

                field.onChange(nextValue === "" ? 0 : event.target.valueAsNumber)
              }}
              placeholder="0"
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
  )
}

export { ProductStockField }
