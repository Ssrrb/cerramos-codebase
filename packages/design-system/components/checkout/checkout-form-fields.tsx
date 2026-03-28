"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@repo/design-system/components/ui/field";
import { FormField } from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/design-system/components/ui/toggle-group";
import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import type {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import type { CheckoutDeliveryMode } from "./types";

export interface CheckoutDeliveryFieldNames<TFieldValues extends FieldValues> {
  addressLine1: FieldPath<TFieldValues>;
  addressLine2: FieldPath<TFieldValues>;
  city: FieldPath<TFieldValues>;
  email: FieldPath<TFieldValues>;
  mode: FieldPath<TFieldValues>;
  notes: FieldPath<TFieldValues>;
  phone: FieldPath<TFieldValues>;
  recipientName: FieldPath<TFieldValues>;
  reference: FieldPath<TFieldValues>;
}

interface CheckoutInputFieldProps<TFieldValues extends FieldValues> {
  autoComplete?: string;
  control: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  name: FieldPath<TFieldValues>;
  placeholder?: string;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
}

function CheckoutInputField<TFieldValues extends FieldValues>({
  autoComplete,
  control,
  description,
  disabled,
  inputMode,
  label,
  name,
  placeholder,
  rules,
  type = "text",
}: CheckoutInputFieldProps<TFieldValues>) {
  const inputId = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <FieldContent>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete={autoComplete}
              disabled={disabled}
              id={inputId}
              inputMode={inputMode}
              placeholder={placeholder}
              type={type}
              value={typeof field.value === "string" ? field.value : ""}
            />
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
      rules={rules}
    />
  );
}

interface CheckoutTextareaFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  label: string;
  name: FieldPath<TFieldValues>;
  placeholder?: string;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
}

function CheckoutTextareaField<TFieldValues extends FieldValues>({
  control,
  description,
  disabled,
  label,
  name,
  placeholder,
  rules,
}: CheckoutTextareaFieldProps<TFieldValues>) {
  const textareaId = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={textareaId}>{label}</FieldLabel>
          <FieldContent>
            <Textarea
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={disabled}
              id={textareaId}
              placeholder={placeholder}
              value={typeof field.value === "string" ? field.value : ""}
            />
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
      rules={rules}
    />
  );
}

interface CheckoutDeliveryModeFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
}

function CheckoutDeliveryModeField<TFieldValues extends FieldValues>({
  control,
  disabled,
  name,
  rules,
}: CheckoutDeliveryModeFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const currentValue =
          (field.value as CheckoutDeliveryMode | undefined) ?? "delivery";

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Modalidad</FieldLabel>
            <FieldContent>
              <ToggleGroup
                className="w-full"
                disabled={disabled}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                type="single"
                value={currentValue}
                variant="outline"
              >
                <ToggleGroupItem className="flex-1" value="delivery">
                  Delivery
                </ToggleGroupItem>
                <ToggleGroupItem className="flex-1" value="pickup">
                  Retiro
                </ToggleGroupItem>
              </ToggleGroup>
              <FieldDescription>
                Elegí cómo el comercio debe preparar este pedido.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        );
      }}
      rules={rules}
    />
  );
}

export { CheckoutDeliveryModeField, CheckoutInputField, CheckoutTextareaField };
