import { isGoogleAuthEnabled } from "@repo/auth/keys";
import { getCurrentCustomerProfile, getSession } from "@repo/auth/server";
import { warmDatabaseConnection } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCheckoutSavedAddresses } from "@/lib/checkout-customer-addresses";
import { getCheckoutLocationData } from "@/lib/checkout-locations";
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
  await warmDatabaseConnection();
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
  await warmDatabaseConnection();
  const checkout = await getPublicProductLinkCheckout(
    commerceSlug,
    productLinkSlug
  );

  if (!checkout) {
    notFound();
  }

  const viewModel = createCheckoutViewModel(checkout);
  const locationData = await getCheckoutLocationData();
  const session = await getSession();
  const customerProfile = session?.user.id
    ? await getCurrentCustomerProfile()
    : null;
  const savedAddresses = customerProfile
    ? await listCheckoutSavedAddresses(customerProfile.id)
    : [];
  const initialAuthUser = session?.user.email
    ? {
        email: session.user.email,
        name: customerProfile?.name ?? session.user.name ?? null,
        phone: customerProfile?.phone ?? null,
      }
    : null;

  return (
    <ProductLinkCheckoutClient
      commerceSlug={commerceSlug}
      copyVariant={viewModel.copyVariant}
      fulfillmentMode={checkout.fulfillmentMode}
      googleEnabled={isGoogleAuthEnabled()}
      initialAuthUser={initialAuthUser}
      initialLocationData={locationData}
      initialSavedAddresses={savedAddresses}
      merchant={viewModel.merchant}
      orderSummary={viewModel.orderSummary}
      paymentRequired={checkout.paymentRequired}
      product={viewModel.product}
      productLinkSlug={productLinkSlug}
      skipFulfillmentStep={viewModel.skipFulfillmentStep}
    />
  );
};

export default ProductLinkCheckoutPage;
