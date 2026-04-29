import { requireSession } from "@repo/auth/server";
import { CustomerOrdenesPage } from "@repo/design-system/components/customer-ordenes";
import type { Metadata } from "next";
import { getCustomerOrdenesPageData } from "@/lib/customer-ordenes";

interface CustomerOrdenesPageRouteProps {
  params: Promise<{
    locale: string;
  }>;
}

export const metadata: Metadata = {
  title: "Tus órdenes | Cerramos",
};

const CustomerOrdenesRoute = async ({
  params,
}: CustomerOrdenesPageRouteProps) => {
  const { locale } = await params;
  const session = await requireSession();

  try {
    const pageData = await getCustomerOrdenesPageData({
      locale,
      userId: session.user.id,
    });

    return <CustomerOrdenesPage {...pageData} />;
  } catch {
    return (
      <CustomerOrdenesPage
        breadcrumbItems={[
          { href: `/${locale}`, label: "Inicio" },
          { label: "Cuenta" },
          { label: "Órdenes" },
        ]}
        errorState={{
          action: {
            href: `/${locale}/account/ordenes`,
            label: "Volver a intentar",
          },
          description:
            "No pudimos cargar tu historial en este momento. Intentá nuevamente en unos minutos.",
          title: "Hubo un problema al recuperar tu cuenta",
        }}
        items={[]}
        showErrorState
        title="Tus órdenes"
      />
    );
  }
};

export default CustomerOrdenesRoute;
