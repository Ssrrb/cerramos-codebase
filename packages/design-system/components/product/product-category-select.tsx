"use client";

import type {
  ProductFieldProps,
  ProductSelectOption,
} from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useId, useState } from "react";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

const CUSTOM_CATEGORY_VALUE = "__custom__";

type ProductCategorySelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = ProductFieldProps<TFieldValues, TName> & {
  emptyStateLabel?: string;
  options: ProductSelectOption[];
};

function ProductCategorySelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description = "Selecciona una categoria existente o crea una nueva para este comercio.",
  disabled,
  emptyStateLabel = "No hay categorias sugeridas",
  label = "Categoria",
  name,
  options,
}: ProductCategorySelectProps<TFieldValues, TName>) {
  const customInputId = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <CategorySelectControl
          customInputId={customInputId}
          description={description}
          disabled={disabled}
          emptyStateLabel={emptyStateLabel}
          field={field}
          label={label}
          options={options}
        />
      )}
    />
  );
}

type CategorySelectControlProps = {
  customInputId: string;
  description: string;
  disabled?: boolean;
  emptyStateLabel: string;
  field: ControllerRenderProps<any, any>;
  label: string;
  options: ProductSelectOption[];
};

function CategorySelectControl({
  customInputId,
  description,
  disabled,
  emptyStateLabel,
  field,
  label,
  options,
}: CategorySelectControlProps) {
  const hasMatchingOption = options.some(
    (option) => option.value === field.value
  );
  const [isCustom, setIsCustom] = useState(
    Boolean(field.value) && !hasMatchingOption
  );

  const selectedValue = isCustom
    ? CUSTOM_CATEGORY_VALUE
    : field.value || undefined;

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-3">
          <Select
            disabled={disabled}
            onValueChange={(value) => {
              if (value === CUSTOM_CATEGORY_VALUE) {
                setIsCustom(true);

                if (hasMatchingOption) {
                  field.onChange("");
                }

                return;
              }

              setIsCustom(false);
              field.onChange(value);
            }}
            value={selectedValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una categoria" />
            </SelectTrigger>
            <SelectContent>
              {options.length === 0 ? (
                <SelectItem disabled value="__empty__">
                  {emptyStateLabel}
                </SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
              <SelectItem value={CUSTOM_CATEGORY_VALUE}>
                Crear nueva categoria
              </SelectItem>
            </SelectContent>
          </Select>
          {isCustom ? (
            <div className="space-y-2 rounded-xl border border-border/80 border-dashed bg-background px-3 py-3">
              <label
                className="text-muted-foreground text-sm"
                htmlFor={customInputId}
              >
                Categoria personalizada
              </label>
              <Input
                disabled={disabled}
                id={customInputId}
                onChange={field.onChange}
                placeholder="Ej. Regalos corporativos"
                value={field.value ?? ""}
              />
              <Button
                disabled={disabled}
                onClick={() => {
                  setIsCustom(false);
                  field.onChange(options[0]?.value ?? "");
                }}
                type="button"
                variant="ghost"
              >
                Volver a las sugerencias
              </Button>
            </div>
          ) : null}
        </div>
      </FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}

export { ProductCategorySelect };
