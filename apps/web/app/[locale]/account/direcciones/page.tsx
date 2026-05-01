import { requireSession } from "@repo/auth/server";
import type { Metadata } from "next";
import { CustomerAddressesPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Tus direcciones | Cerramos",
};

const CustomerAddressesRoute = async () => {
  await requireSession();

  return <CustomerAddressesPageClient />;
};

export default CustomerAddressesRoute;
