import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createProductLinkAction } from "./actions/product-links";
import { ProductsCatalog } from "./components/products-catalog";
import { getProductsCatalogData } from "./products-catalog.server";

export const metadata: Metadata = {
  description: "Gestiona tu catálogo de productos y links vendibles.",
  title: "Catálogo | Cerramos",
};

const App = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/onboarding");
  }

  const { metrics, products } = await getProductsCatalogData(orgId);

  return (
    <ProductsCatalog
      createProductLinkAction={createProductLinkAction}
      metrics={metrics}
      products={products}
    />
  );
};

export default App;
