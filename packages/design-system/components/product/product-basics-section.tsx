"use client";
import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductDeliveryIncludedField } from "@repo/design-system/components/product/product-delivery-included-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductLogisticsNoteCard } from "@repo/design-system/components/product/product-logistics-note-card";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductPriceField } from "@repo/design-system/components/product/product-price-field";
import { ProductChoiceCardsField } from "@repo/design-system/components/product/product-choice-cards-field";
import {
  ProductSetupStepCard,
  type ProductSetupStep,
} from "@repo/design-system/components/product/product-setup-step-card";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import type { ProductSelectOption } from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useState } from "react";
import {
  useController,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

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
  const { field: stockField } = useController({
    control,
    name: stockName,
  });
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
  const isService = String(kindValue) === "service";
  const stockValue = stockField.value;
  const updateStock = stockField.onChange;

  useEffect(() => {
    if (isService && stockValue !== 0) {
      updateStock(0);
    }
  }, [isService, stockValue, updateStock]);

  return (
    <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.32),hsl(var(--background))_28%)]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="space-y-5 xl:space-y-6">
          <ProductSetupStepCard
            activeStep={activeStep}
            completed={completedSteps.kind}
            onEdit={setActiveStep}
            step="kind"
            summary={[`Tipo elegido: ${selectedKindLabel}`]}
            title="1. Elegí el tipo de oferta"
          >
            <div className="space-y-6">
              <ProductChoiceCardsField
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
          </ProductSetupStepCard>

          <ProductSetupStepCard
            activeStep={activeStep}
            completed={completedSteps.delivery}
            onEdit={setActiveStep}
            step="delivery"
            summary={[
              deliveryIncludedValue
                ? isService
                  ? "El servicio puede mostrar logística desde el checkout."
                  : "El delivery ya está incluido en el precio."
                : isService
                  ? "El servicio arranca sin logística visible en el checkout."
                  : "El delivery se coordina aparte del precio base.",
            ]}
            title="2. Definí la logística comercial"
          >
            <div className="space-y-6">
              <ProductDeliveryIncludedField
                control={control}
                disabled={disabled}
                isService={isService}
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
          </ProductSetupStepCard>

          <ProductSetupStepCard
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
            <div className="space-y-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.95fr)] xl:items-start">
                <div className="min-w-0 space-y-6">
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
                <div className="min-w-0 space-y-6 xl:pl-3">
                  <ProductImageUpload
                    control={control}
                    disabled={disabled}
                    name={imageName}
                    uploadUrl={imageUploadUrl}
                  />
                </div>
              </div>
              <Separator />
              <div
                className={cn(
                  "grid gap-6 lg:gap-x-6 lg:gap-y-6",
                  isService
                    ? "md:grid-cols-2"
                    : "md:grid-cols-2 xl:grid-cols-3"
                )}
              >
                <div className="min-w-0">
                  <ProductPriceField
                    control={control}
                    disabled={disabled}
                    name={priceName}
                  />
                </div>
                <div className="min-w-0">
                  <ProductStatusSelect
                    control={control}
                    disabled={disabled}
                    name={statusName}
                    options={statusOptions}
                  />
                </div>
                {isService ? null : (
                  <div className="min-w-0">
                    <ProductStockField
                      control={control}
                      disabled={disabled}
                      name={stockName}
                    />
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]"
                )}
              >
                <ProductCategorySelect
                  control={control}
                  disabled={disabled}
                  name={categoryName}
                  options={categoryOptions}
                />
                <ProductLogisticsNoteCard
                  deliveryIncluded={Boolean(deliveryIncludedValue)}
                  isService={isService}
                  kindLabel={selectedKindLabel}
                />
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
          </ProductSetupStepCard>
        </div>
      </div>
    </div>
  );
}

export { ProductBasicsSection };
