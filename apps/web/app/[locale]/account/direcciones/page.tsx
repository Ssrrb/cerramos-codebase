import { getCurrentCustomerProfile, requireSession } from "@repo/auth/server";
import { normalizeReturnTo } from "@repo/auth/utils";
import { CustomerAccountHeader } from "@repo/design-system/components/customer-ordenes";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { getCustomerAddressesPageData } from "@/lib/customer-addresses";
import { CustomerAddressesPageClient } from "./page-client";

interface CustomerAddressesPageRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    returnTo?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: "Tus direcciones | Cerramos",
};

const CustomerAddressesRoute = async ({
  params,
  searchParams,
}: CustomerAddressesPageRouteProps) => {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const returnToParam = Array.isArray(resolvedSearchParams?.returnTo)
    ? resolvedSearchParams.returnTo[0]
    : resolvedSearchParams?.returnTo;
  const returnToHref = normalizeReturnTo(returnToParam);
  const session = await requireSession();

  try {
    const customerProfile = await getCurrentCustomerProfile();
    const customerId = customerProfile?.id ?? session.user.customerId;
    const initialAddresses = customerId
      ? await getCustomerAddressesPageData(customerId)
      : [];

    return (
      <CustomerAddressesPageClient
        initialAddresses={initialAddresses}
        returnToHref={returnToHref}
      />
    );
  } catch {
    const breadcrumbItems = [
      { href: `/${locale}`, label: "Inicio" },
      { label: "Cuenta" },
      { label: "Direcciones" },
    ];
    const errorState = {
      action: {
        href: `/${locale}/account/direcciones`,
        label: "Volver a intentar",
      },
      description:
        "No pudimos cargar tus direcciones en este momento. Intentá nuevamente en unos minutos.",
      title: "Hubo un problema al recuperar tu cuenta",
    };

    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-12">
        <div className="space-y-8">
          <CustomerAccountHeader
            breadcrumbItems={breadcrumbItems}
            description="Guardá las direcciones que usás para comprar más rápido en Cerramos."
            title="Tus direcciones"
          />
          <Empty className="rounded-[1.5rem] border border-border border-dashed bg-background/80 py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{errorState.title}</EmptyTitle>
              <EmptyDescription>{errorState.description}</EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-col gap-2 sm:flex-row">
              {returnToHref ? (
                <Button asChild variant="outline">
                  <a href={returnToHref}>
                    <ArrowLeft className="size-4" />
                    Volver al checkout
                  </a>
                </Button>
              ) : null}
              <Button asChild>
                <a href={errorState.action.href}>{errorState.action.label}</a>
              </Button>
            </div>
          </Empty>
        </div>
      </main>
    );
  }
};

export default CustomerAddressesRoute;
