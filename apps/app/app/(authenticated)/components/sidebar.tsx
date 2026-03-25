"use client";

import { OrganizationSwitcher, UserButton } from "@repo/auth/client";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/design-system/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import { NotificationsTrigger } from "@repo/notifications/components/trigger";
import {
  BoxesIcon,
  ChevronRightIcon,
  LifeBuoyIcon,
  SearchIcon,
  SendIcon,
  WebhookIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Search } from "./search";

interface GlobalSidebarProperties {
  readonly children: ReactNode;
}

const commerceNavigation = {
  navMain: [
    {
      title: "Productos",
      url: "/",
      icon: BoxesIcon,
      items: [
        {
          title: "Catálogo",
          url: "/",
        },
        {
          title: "Buscar",
          url: "/search?q=producto",
        },
        {
          title: "Webhooks",
          url: "/webhooks",
        },
      ],
    },
    {
      title: "Búsqueda",
      url: "/search?q=producto",
      icon: SearchIcon,
    },
    {
      title: "Webhooks",
      url: "/webhooks",
      icon: WebhookIcon,
    },
  ],
};

export const GlobalSidebar = ({ children }: GlobalSidebarProperties) => {
  const sidebar = useSidebar();
  const pathname = usePathname();
  const productsSectionActive =
    pathname === "/" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/webhooks");
  const [productsSectionOpen, setProductsSectionOpen] =
    useState(productsSectionActive);

  useEffect(() => {
    if (productsSectionActive) {
      setProductsSectionOpen(true);
    }
  }, [productsSectionActive]);

  useEffect(() => {
    if (!sidebar.isMobile && productsSectionActive && !sidebar.open) {
      sidebar.setOpen(true);
    }
  }, [productsSectionActive, sidebar]);

  return (
    <>
      <Sidebar
        className="authenticated-sidebar-theme"
        collapsible="icon"
        variant="inset"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={cn(
                  "authenticated-sidebar-switcher",
                  !sidebar.open && "authenticated-sidebar-switcher-collapsed"
                )}
              >
                <OrganizationSwitcher
                  afterSelectOrganizationUrl="/"
                  hidePersonal
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Search />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Comercio</SidebarGroupLabel>
            <SidebarMenu>
              {commerceNavigation.navMain.map((item) => (
                <Collapsible
                  asChild
                  key={item.title}
                  onOpenChange={
                    item.title === "Productos" ? setProductsSectionOpen : undefined
                  }
                  open={
                    item.title === "Productos" ? productsSectionOpen : undefined
                  }
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.title === "Productos"
                          ? productsSectionActive
                          : pathname === item.url.split("?")[0]
                      }
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRightIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    pathname === subItem.url.split("?")[0]
                                  }
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Soporte</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ayuda">
                    <Link href="/webhooks">
                      <LifeBuoyIcon />
                      <span>Ayuda</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Feedback">
                    <Link href="/search?q=feedback">
                      <SendIcon />
                      <span>Feedback</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "flex overflow-hidden w-full",
                    userButtonBox: "flex-row-reverse",
                    userButtonOuterIdentifier: "truncate pl-0",
                  },
                }}
                showName
              />
              <div className="flex shrink-0 items-center gap-px">
                <ModeToggle />
                <Button
                  asChild
                  className="shrink-0"
                  size="icon"
                  variant="ghost"
                >
                  <div className="h-4 w-4">
                    <NotificationsTrigger />
                  </div>
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </>
  );
};
