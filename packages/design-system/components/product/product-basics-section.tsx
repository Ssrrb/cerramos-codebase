"use client";

import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDeliveryToggle } from "@repo/design-system/components/product/product-delivery-toggle";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductPriceField } from "@repo/design-system/components/product/product-price-field";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import type { ProductSelectOption } from "@repo/design-system/components/product/types";
import { Separator } from "@repo/design-system/components/ui/separator";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

type ProductBasicsSectionProps<TFieldValues extends FieldValues> = {
  categoryName: FieldPath<TFieldValues>;
  categoryOptions: ProductSelectOption[];
  control: Control<TFieldValues>;
  deliveryIncludedName: FieldPath<TFieldValues>;
  descriptionName: FieldPath<TFieldValues>;
  disabled?: boolean;
  imageName: FieldPath<TFieldValues>;
  imageUploadUrl: string;
  nameName: FieldPath<TFieldValues>;
  priceName: FieldPath<TFieldValues>;
  statusName: FieldPath<TFieldValues>;
  statusOptions: ProductSelectOption[];
  stockName: FieldPath<TFieldValues>;
};

function ProductBasicsSection<TFieldValues extends FieldValues>({
  categoryName,
  categoryOptions,
  control,
  deliveryIncludedName,
  descriptionName,
  disabled,
  imageName,
  imageUploadUrl,
  nameName,
  priceName,
  statusName,
  statusOptions,
  stockName,
}: ProductBasicsSectionProps<TFieldValues>) {
  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-background px-5 py-5 shadow-xs">
      <div className="space-y-1">
        <h2 className="font-semibold text-base text-foreground">
          Informacion principal
        </h2>
        <p className="text-muted-foreground text-sm">
          Define la identidad visual y operativa del producto antes de
          publicarlo.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
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
      <div className="grid gap-6 md:grid-cols-3">
        <ProductStatusSelect
          control={control}
          disabled={disabled}
          name={statusName}
          options={statusOptions}
        />
        <ProductPriceField
          control={control}
          disabled={disabled}
          name={priceName}
        />
        <ProductStockField
          control={control}
          disabled={disabled}
          name={stockName}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <ProductCategorySelect
          control={control}
          disabled={disabled}
          name={categoryName}
          options={categoryOptions}
        />
        <ProductDeliveryToggle
          control={control}
          disabled={disabled}
          name={deliveryIncludedName}
        />
      </div>
    </section>
  );
}

export { ProductBasicsSection };
