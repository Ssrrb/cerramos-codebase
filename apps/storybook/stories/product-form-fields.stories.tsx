import { zodResolver } from "@hookform/resolvers/zod";
import { ProductBasicsSection } from "@repo/design-system/components/product/product-basics-section";
import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDeliveryToggle } from "@repo/design-system/components/product/product-delivery-toggle";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import { Form } from "@repo/design-system/components/ui/form";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import type { Resolver, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  type AddProductFormValues,
  addProductFormSchema,
  defaultAddProductFormValues,
  formatProductKindLabel,
  productCategorySuggestions,
  productKindValues,
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
  label: (() => {
    if (status === "active") {
      return "Activo";
    }

    if (status === "inactive") {
      return "Inactivo";
    }

    return "Borrador";
  })(),
  value: status,
}));

const categoryOptions = productCategorySuggestions.map((category) => ({
  label: category,
  value: category,
}));

const kindOptions = productKindValues.map((kind) => ({
  label: formatProductKindLabel(kind),
  value: kind,
}));

const StoryForm = ({
  children,
}: {
  children: (form: UseFormReturn<AddProductFormValues>) => ReactNode;
}) => {
  const form = useForm<AddProductFormValues>({
    defaultValues: defaultAddProductFormValues,
    resolver: zodResolver(
      addProductFormSchema
    ) as Resolver<AddProductFormValues>,
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Form {...form}>
        <form className="space-y-6">{children(form)}</form>
      </Form>
    </div>
  );
};

const FullWidthStoryForm = ({
  children,
}: {
  children: (form: UseFormReturn<AddProductFormValues>) => ReactNode;
}) => {
  const form = useForm<AddProductFormValues>({
    defaultValues: defaultAddProductFormValues,
    resolver: zodResolver(
      addProductFormSchema
    ) as Resolver<AddProductFormValues>,
  });

  return (
    <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.32),hsl(var(--background))_28%)]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Form {...form}>
          <form className="space-y-6">{children(form)}</form>
        </Form>
      </div>
    </div>
  );
};

const renderNameField = (form: UseFormReturn<AddProductFormValues>) => (
  <ProductNameField control={form.control} name="name" />
);

export const NameField: Story = {
  render: () => <StoryForm>{renderNameField}</StoryForm>,
};

export const DescriptionField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDescriptionField control={form.control} name="description" />
      )}
    </StoryForm>
  ),
};

export const StatusField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductStatusSelect
          control={form.control}
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
      {(form) => <ProductStockField control={form.control} name="stock" />}
    </StoryForm>
  ),
};

export const DeliveryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDeliveryToggle control={form.control} name="deliveryIncluded" />
      )}
    </StoryForm>
  ),
};

export const CategoryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductCategorySelect
          control={form.control}
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
          control={form.control}
          name="image"
          uploadUrl="/api/products/image-upload"
        />
      )}
    </StoryForm>
  ),
};

export const SequentialFlow: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <FullWidthStoryForm>
      {(form) => (
        <ProductBasicsSection
          categoryName="category"
          categoryOptions={categoryOptions}
          control={form.control}
          deliveryIncludedName="deliveryIncluded"
          descriptionName="description"
          imageName="image"
          imageUploadUrl="/api/products/image-upload"
          kindName="kind"
          kindOptions={kindOptions}
          nameName="name"
          priceName="unitPrice"
          statusName="status"
          statusOptions={statusOptions}
          stockName="stock"
        />
      )}
    </FullWidthStoryForm>
  ),
};
