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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
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
  cityId: FieldPath<TFieldValues>;
  countryId: FieldPath<TFieldValues>;
  email: FieldPath<TFieldValues>;
  mode: FieldPath<TFieldValues>;
  notes: FieldPath<TFieldValues>;
  phone: FieldPath<TFieldValues>;
  referenceNote: FieldPath<TFieldValues>;
  recipientName: FieldPath<TFieldValues>;
  stateId: FieldPath<TFieldValues>;
  streetLine1: FieldPath<TFieldValues>;
  streetLine2: FieldPath<TFieldValues>;
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

interface CheckoutSelectFieldOption {
  label: string;
  value: string;
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

interface CheckoutSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  label: string;
  name: FieldPath<TFieldValues>;
  options: readonly CheckoutSelectFieldOption[];
  placeholder?: string;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
}

function CheckoutSelectField<TFieldValues extends FieldValues>({
  control,
  description,
  disabled,
  label,
  name,
  options,
  placeholder,
  rules,
}: CheckoutSelectFieldProps<TFieldValues>) {
  const inputId = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <FieldContent>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              value={typeof field.value === "string" ? field.value : undefined}
            >
              <SelectTrigger
                aria-invalid={fieldState.invalid}
                className="w-full"
                id={inputId}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  deliveryEnabled?: boolean;
  disabled?: boolean;
  name: FieldPath<TFieldValues>;
  pickupEnabled?: boolean;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
}

function CheckoutDeliveryModeField<TFieldValues extends FieldValues>({
  control,
  deliveryEnabled = true,
  disabled,
  name,
  pickupEnabled = true,
  rules,
}: CheckoutDeliveryModeFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        let modeDescription = "Este link solo permite retiro.";

        if (deliveryEnabled && pickupEnabled) {
          modeDescription = "Elegí cómo el comercio debe preparar este pedido.";
        } else if (deliveryEnabled) {
          modeDescription = "Este link solo permite delivery.";
        }

        const availableModes = [
          deliveryEnabled ? "delivery" : null,
          pickupEnabled ? "pickup" : null,
        ].filter(Boolean) as CheckoutDeliveryMode[];
        const currentValue =
          (field.value as CheckoutDeliveryMode | undefined) ??
          availableModes[0] ??
          "delivery";

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
                {deliveryEnabled ? (
                  <ToggleGroupItem className="flex-1" value="delivery">
                    Delivery
                  </ToggleGroupItem>
                ) : null}
                {pickupEnabled ? (
                  <ToggleGroupItem className="flex-1" value="pickup">
                    Retiro
                  </ToggleGroupItem>
                ) : null}
              </ToggleGroup>
              <FieldDescription>{modeDescription}</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        );
      }}
      rules={rules}
    />
  );
}

export {
  CheckoutDeliveryModeField,
  CheckoutInputField,
  CheckoutSelectField,
  CheckoutTextareaField,
};
