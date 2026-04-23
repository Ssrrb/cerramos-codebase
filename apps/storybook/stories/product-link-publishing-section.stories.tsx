import { zodResolver } from "@hookform/resolvers/zod";
import { ProductLinkPublishingSection } from "@repo/design-system/components/product/product-link-publishing-section";
import { Form } from "@repo/design-system/components/ui/form";
import type { Meta, StoryObj } from "@storybook/react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  billingModeValues,
  defaultProductLinkFormValues,
  formatBillingModeLabel,
  formatFulfillmentModeLabel,
  formatProductLinkStatusLabel,
  fulfillmentModeValues,
  productLinkFormSchema,
  productLinkStatusValues,
  subscriptionCadenceValues,
  type ProductLinkFormValues,
} from "../../app/lib/product-links";
import { formatProductUnitPriceLabel } from "../../app/lib/products";

const meta: Meta<typeof ProductLinkPublishingSection> = {
  title: "product/Link Publishing Flow",
  component: ProductLinkPublishingSection,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductLinkPublishingSection>;

export default meta;

type Story = StoryObj<typeof meta>;

const billingModeOptions = billingModeValues.map((value) => ({
  label: formatBillingModeLabel(value),
  value,
}));

const fulfillmentModeOptions = fulfillmentModeValues.map((value) => ({
  label: formatFulfillmentModeLabel(value),
  value,
}));

const statusOptions = productLinkStatusValues.map((value) => ({
  label: formatProductLinkStatusLabel(value),
  value,
}));

const subscriptionCadenceOptions = subscriptionCadenceValues.map((value) => ({
  label: "Mensual",
  value,
}));

export const HappyPath: Story = {
  render: () => {
    const form = useForm<ProductLinkFormValues>({
      defaultValues: defaultProductLinkFormValues({
        category: "Electrodomesticos",
        deliveryIncluded: true,
        description: "Licuadora premium para cocina diaria.",
        id: "product_1",
        image: "https://cdn.example.test/licuadora.png",
        imageObjectKey: "products/commerce_1/images/licuadora.png",
        kind: "product",
        name: "Licuadora Cerramos",
        status: "active",
        stock: 12,
        unitPrice: 185_000,
      }),
      resolver: zodResolver(
        productLinkFormSchema
      ) as Resolver<ProductLinkFormValues>,
    });

    return (
      <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.22),hsl(var(--background))_26%)] px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Form {...form}>
            <form className="space-y-6">
              <ProductLinkPublishingSection
                billingModeName="billingMode"
                billingModeOptions={billingModeOptions}
                control={form.control}
                descriptionName="description"
                expiresAtName="expiresAt"
                fulfillmentModeName="fulfillmentMode"
                fulfillmentModeOptions={fulfillmentModeOptions}
                paymentRequiredName="paymentRequired"
                publicPath="/buy/cerramos/licuadora-cerramos"
                productImageUrl="https://cdn.example.test/licuadora.png"
                productName="Licuadora Cerramos"
                productPriceLabel={`Gs. ${formatProductUnitPriceLabel(185_000)}`}
                slugName="slug"
                statusName="status"
                statusOptions={statusOptions}
                subscriptionCadenceName="subscriptionCadence"
                subscriptionCadenceOptions={subscriptionCadenceOptions}
                titleName="title"
              />
            </form>
          </Form>
        </div>
      </div>
    );
  },
};
