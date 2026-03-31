import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ProductBasicsSection } from "@repo/design-system/components/product/product-basics-section";
import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDeliveryToggle } from "@repo/design-system/components/product/product-delivery-toggle";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import { Form } from "@repo/design-system/components/ui/form";
import {
  addProductFormSchema,
  defaultAddProductFormValues,
  productCategorySuggestions,
  productStatusValues,
} from "../../app/lib/products";

const meta: Meta<typeof ProductBasicsSection> = {
  title: "product/Product Form Fields",
  component: ProductBasicsSection,
  tags: ["autodocs"],
} satisfies Meta<typeof ProductBasicsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

const statusOptions = productStatusValues.map((status) => ({
  label:
    status === "active"
      ? "Activo"
      : status === "inactive"
        ? "Inactivo"
        : "Borrador",
  value: status,
}));

const categoryOptions = productCategorySuggestions.map((category) => ({
  label: category,
  value: category,
}));

const StoryFormProvider = Form as any;

const StoryForm = ({
  children,
}: {
  children: (form: any) => ReactNode;
}) => {
  const form = useForm<any>({
    defaultValues: defaultAddProductFormValues,
    resolver: zodResolver(addProductFormSchema),
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <StoryFormProvider {...form}>
        <form className="space-y-6">{children(form)}</form>
      </StoryFormProvider>
    </div>
  );
};

const renderNameField = (form: any) => (
  <ProductNameField control={form.control as any} name="name" />
);

export const NameField: Story = {
  render: () => <StoryForm>{renderNameField}</StoryForm>,
};

export const DescriptionField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDescriptionField control={form.control as any} name="description" />
      )}
    </StoryForm>
  ),
};

export const StatusField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductStatusSelect
          control={form.control as any}
          name="status"
          options={statusOptions}
        />
      )}
    </StoryForm>
  ),
};

export const StockField: Story = {
  render: () => (
    <StoryForm>
      {(form) => <ProductStockField control={form.control as any} name="stock" />}
    </StoryForm>
  ),
};

export const DeliveryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDeliveryToggle
          control={form.control as any}
          name="deliveryIncluded"
        />
      )}
    </StoryForm>
  ),
};

export const CategoryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductCategorySelect
          control={form.control as any}
          name="category"
          options={categoryOptions}
        />
      )}
    </StoryForm>
  ),
};

export const ImageField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductImageUpload
          control={form.control as any}
          name="image"
          uploadUrl="/api/products/image-upload"
        />
      )}
    </StoryForm>
  ),
};

export const BasicsSection: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductBasicsSection
          categoryName="category"
          categoryOptions={categoryOptions}
          control={form.control as any}
          deliveryIncludedName="deliveryIncluded"
          descriptionName="description"
          imageName="image"
          imageUploadUrl="/api/products/image-upload"
          nameName="name"
          statusName="status"
          statusOptions={statusOptions}
          stockName="stock"
        />
      )}
    </StoryForm>
  ),
};
