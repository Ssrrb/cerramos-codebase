"use client";

import type { ProductSelectOption } from "@repo/design-system/components/product/types";
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

interface ProductChoiceCardsFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  label: string;
  name: TName;
  options: ProductSelectOption[];
}

function ProductChoiceCardsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description,
  disabled,
  label,
  name,
  options,
}: ProductChoiceCardsFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <div className="space-y-1">
            <FormLabel>{label}</FormLabel>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
          </div>
          <FormControl>
            <RadioGroup
              className="grid gap-3 md:grid-cols-2"
              onValueChange={field.onChange}
              value={String(field.value ?? "")}
            >
              {options.map((option) => {
                const itemId = `${String(name)}-${option.value}`;
                const isSelected = field.value === option.value;

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
                      <div className="font-medium text-sm">{option.label}</div>
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

export { ProductChoiceCardsField };
