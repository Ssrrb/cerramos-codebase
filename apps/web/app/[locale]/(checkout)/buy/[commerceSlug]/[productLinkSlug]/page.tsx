import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createCheckoutViewModel,
  getPublicProductLinkCheckout,
} from "@/lib/product-links";
import { ProductLinkCheckoutClient } from "./product-link-checkout-client";

interface ProductLinkCheckoutPageProps {
  params: Promise<{
    commerceSlug: string;
    locale: string;
    productLinkSlug: string;
  }>;
}

export const revalidate = 0;

export const generateMetadata = async ({
  params,
}: ProductLinkCheckoutPageProps): Promise<Metadata> => {
  const { commerceSlug, productLinkSlug } = await params;
  const checkout = await getPublicProductLinkCheckout(
    commerceSlug,
    productLinkSlug
  );

  return {
    description:
      checkout?.description ??
      "Checkout publico generado desde Cerramos para cerrar un pedido por link.",
    robots: {
      follow: false,
      index: false,
    },
    title: checkout
      ? `${checkout.title} | ${checkout.commerceName}`
      : "Checkout | Cerramos",
  };
};

const ProductLinkCheckoutPage = async ({
  params,
}: ProductLinkCheckoutPageProps) => {
  const { commerceSlug, productLinkSlug } = await params;
  const checkout = await getPublicProductLinkCheckout(
    commerceSlug,
    productLinkSlug
  );

  if (!checkout) {
    notFound();
  }

  const viewModel = createCheckoutViewModel(checkout);

  return (
    <ProductLinkCheckoutClient
      commerceSlug={commerceSlug}
      deliveryEnabled={checkout.deliveryEnabled}
      merchant={viewModel.merchant}
      orderSummary={viewModel.orderSummary}
      paymentRequired={checkout.paymentRequired}
      pickupEnabled={checkout.pickupEnabled}
      product={viewModel.product}
      productLinkSlug={productLinkSlug}
    />
  );
};

export default ProductLinkCheckoutPage;
