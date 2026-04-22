"use client";
import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductPriceField } from "@repo/design-system/components/product/product-price-field";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import type { ProductSelectOption } from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
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
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon, PencilLineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useWatch } from "react-hook-form";

interface ProductBasicsSectionProps<TFieldValues extends FieldValues> {
  categoryName: FieldPath<TFieldValues>;
  categoryOptions: ProductSelectOption[];
  control: Control<TFieldValues>;
  deliveryIncludedName: FieldPath<TFieldValues>;
  descriptionName: FieldPath<TFieldValues>;
  disabled?: boolean;
  imageName: FieldPath<TFieldValues>;
  imageUploadUrl: string;
  kindName: FieldPath<TFieldValues>;
  kindOptions: ProductSelectOption[];
  nameName: FieldPath<TFieldValues>;
  priceName: FieldPath<TFieldValues>;
  statusName: FieldPath<TFieldValues>;
  statusOptions: ProductSelectOption[];
  stockName: FieldPath<TFieldValues>;
}

type ProductSetupStep = "kind" | "delivery" | "details";

interface ChoiceCardsFieldProps<
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

interface StepCardProps {
  activeStep: ProductSetupStep;
  children: ReactNode;
  completed?: boolean;
  onEdit: (step: ProductSetupStep) => void;
  step: ProductSetupStep;
  summary: string[];
  title: string;
}

function ChoiceCardsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description,
  disabled,
  label,
  name,
  options,
}: ChoiceCardsFieldProps<TFieldValues, TName>) {
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

function DeliveryIncludedField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  disabled,
  name,
}: {
  control: Control<TFieldValues>;
  disabled?: boolean;
  name: TName;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <div className="space-y-1">
            <FormLabel>¿El delivery ya está incluido?</FormLabel>
            <FormDescription>
              Definí si el precio publicado ya contempla el costo de entrega o
              si esa coordinación queda fuera de esta oferta.
            </FormDescription>
          </div>
          <FormControl>
            <RadioGroup
              className="grid gap-3 md:grid-cols-2"
              onValueChange={(value) => field.onChange(value === "true")}
              value={field.value ? "true" : "false"}
            >
              {[
                {
                  description:
                    "Úsalo cuando el precio final ya absorbe la logística y no hace falta desglosarla aparte.",
                  title: "Sí, está incluido",
                  value: "true",
                },
                {
                  description:
                    "Ideal cuando la entrega se cotiza aparte, se coordina después o no forma parte del precio base.",
                  title: "No, se coordina aparte",
                  value: "false",
                },
              ].map((option) => {
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

function StepCard({
  activeStep,
  children,
  completed,
  onEdit,
  step,
  summary,
  title,
}: StepCardProps) {
  if (activeStep === step) {
    return (
      <Card className="rounded-[1.75rem] border-border/70 bg-background/95 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Paso activo
            </p>
            <CardTitle className="text-2xl tracking-[-0.03em]">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <button
      className="w-full rounded-[1.5rem] border border-border/70 bg-background px-5 py-5 text-left shadow-xs transition-colors hover:border-foreground/20"
      onClick={() => onEdit(step)}
      type="button"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            {completed ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="size-3.5" />
              </span>
            ) : null}
            <p className="font-medium text-base text-foreground">{title}</p>
          </div>
          <div className="space-y-1">
            {summary.length > 0 ? (
              summary.map((line) => (
                <p
                  className="text-muted-foreground text-sm leading-relaxed"
                  key={line}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Volvé a abrir este paso para ajustar la configuración.
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 font-medium text-foreground text-sm">
          <PencilLineIcon className="size-4" />
          Editar
        </span>
      </div>
    </button>
  );
}

function ProductBasicsSection<TFieldValues extends FieldValues>({
  categoryName,
  categoryOptions,
  control,
  deliveryIncludedName,
  descriptionName,
  disabled,
  imageName,
  imageUploadUrl,
  kindName,
  kindOptions,
  nameName,
  priceName,
  statusName,
  statusOptions,
  stockName,
}: ProductBasicsSectionProps<TFieldValues>) {
  const [activeStep, setActiveStep] = useState<ProductSetupStep>("kind");
  const [completedSteps, setCompletedSteps] = useState<
    Partial<Record<ProductSetupStep, true>>
  >({});
  const kindValue = useWatch({
    control,
    name: kindName,
  });
  const deliveryIncludedValue = useWatch({
    control,
    name: deliveryIncludedName,
  });
  const productName = useWatch({
    control,
    name: nameName,
  });
  const categoryValue = useWatch({
    control,
    name: categoryName,
  });
  const statusValue = useWatch({
    control,
    name: statusName,
  });

  const selectedKindLabel =
    kindOptions.find((option) => option.value === String(kindValue))?.label ??
    "Sin definir";
  const selectedStatusLabel =
    statusOptions.find((option) => option.value === String(statusValue))
      ?.label ?? "Sin definir";

  return (
    <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.32),hsl(var(--background))_28%)]">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_22rem]">
        <div className="space-y-4">
          <StepCard
            activeStep={activeStep}
            completed={completedSteps.kind}
            onEdit={setActiveStep}
            step="kind"
            summary={[`Tipo elegido: ${selectedKindLabel}`]}
            title="1. Elegí el tipo de oferta"
          >
            <div className="space-y-6">
              <ChoiceCardsField
                control={control}
                description="Esto ajusta cómo se interpreta el producto dentro del flujo."
                disabled={disabled}
                label="Tipo de producto"
                name={kindName}
                options={kindOptions}
              />
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      kind: true,
                    }));
                    setActiveStep("delivery");
                  }}
                  type="button"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </StepCard>

          <StepCard
            activeStep={activeStep}
            completed={completedSteps.delivery}
            onEdit={setActiveStep}
            step="delivery"
            summary={[
              deliveryIncludedValue
                ? "El delivery ya está incluido en el precio."
                : "El delivery se coordina aparte del precio base.",
            ]}
            title="2. Definí la logística comercial"
          >
            <div className="space-y-6">
              <DeliveryIncludedField
                control={control}
                disabled={disabled}
                name={deliveryIncludedName}
              />
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      delivery: true,
                    }));
                    setActiveStep("details");
                  }}
                  type="button"
                >
                  Completar datos
                </Button>
              </div>
            </div>
          </StepCard>

          <StepCard
            activeStep={activeStep}
            completed={completedSteps.details}
            onEdit={setActiveStep}
            step="details"
            summary={[
              typeof productName === "string" && productName.trim()
                ? productName
                : "Nombre pendiente",
              typeof categoryValue === "string" && categoryValue.trim()
                ? `Categoría: ${categoryValue}`
                : "Categoría pendiente",
              `Estado: ${selectedStatusLabel}`,
            ]}
            title="3. Cargá los datos del producto"
          >
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)]">
                <div className="space-y-6">
                  <ProductNameField
                    control={control}
                    disabled={disabled}
                    name={nameName}
                  />
                  <ProductDescriptionField
                    control={control}
                    disabled={disabled}
                    name={descriptionName}
                  />
                </div>
                <div className="space-y-6">
                  <ProductImageUpload
                    control={control}
                    disabled={disabled}
                    name={imageName}
                    uploadUrl={imageUploadUrl}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid gap-6 md:grid-cols-3">
                <ProductPriceField
                  control={control}
                  disabled={disabled}
                  name={priceName}
                />
                <ProductStatusSelect
                  control={control}
                  disabled={disabled}
                  name={statusName}
                  options={statusOptions}
                />
                <ProductStockField
                  control={control}
                  disabled={disabled}
                  name={stockName}
                />
              </div>
              <div
                className={cn(
                  "grid gap-6",
                  deliveryIncludedValue
                    ? "md:grid-cols-1"
                    : "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                )}
              >
                <ProductCategorySelect
                  control={control}
                  disabled={disabled}
                  name={categoryName}
                  options={categoryOptions}
                />
                {deliveryIncludedValue ? null : (
                  <Card className="rounded-2xl border-border/70 bg-muted/25 py-0 shadow-none">
                    <CardContent className="px-5 py-5">
                      <p className="font-medium text-foreground text-sm">
                        El delivery se coordina por separado
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-relaxed">
                        <p className="text-muted-foreground">
                          Oferta de tipo {selectedKindLabel.toLowerCase()}.
                        </p>
                        <p className="text-muted-foreground">
                          El precio base no incluye la entrega, así que ese
                          costo debe cotizarse o acordarse fuera de esta ficha.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      details: true,
                    }));
                  }}
                  type="button"
                >
                  Validar configuración
                </Button>
              </div>
            </div>
          </StepCard>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[1.5rem] border-border/70 bg-background/95 shadow-xs lg:sticky lg:top-8">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Resumen del flujo</CardTitle>
              <CardDescription>
                Las decisiones principales permanecen visibles mientras se carga
                el resto del formulario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium text-foreground">
                  {selectedKindLabel}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Delivery</p>
                <p className="font-medium text-foreground">
                  {deliveryIncludedValue ? "Incluido" : "No incluido"}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground">Estado de carga</p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    {completedSteps.kind
                      ? "El tipo de oferta ya fue definido."
                      : "Falta confirmar el tipo de oferta."}
                  </li>
                  <li>
                    {completedSteps.delivery
                      ? "La política de delivery ya está definida."
                      : "Falta definir cómo impacta el delivery en el precio."}
                  </li>
                  <li>
                    {completedSteps.details
                      ? "La configuración principal del producto fue revisada."
                      : "Todavía falta revisar los datos principales del producto."}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { ProductBasicsSection };
