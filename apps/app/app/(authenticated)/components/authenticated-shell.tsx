"use client";

import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GlobalSidebar } from "./sidebar";

interface AuthenticatedShellProperties {
  readonly betaFeature?: ReactNode;
  readonly children: ReactNode;
}

const isCommerceRoute = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/search") ||
  pathname.startsWith("/webhooks");

export const AuthenticatedShell = ({
  betaFeature,
  children,
}: AuthenticatedShellProperties) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      isCommerceRoute(pathname)
    ) {
      setSidebarOpen(true);
    }
  }, [pathname]);

  return (
    <SidebarProvider onOpenChange={setSidebarOpen} open={sidebarOpen}>
      <GlobalSidebar>
        {betaFeature}
        {children}
      </GlobalSidebar>
    </SidebarProvider>
  );
};
