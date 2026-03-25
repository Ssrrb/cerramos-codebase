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
  Settings2Icon,
  WebhookIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "./search";

interface GlobalSidebarProperties {
  readonly children: ReactNode;
}

const data = {
  navMain: [
    {
      title: "Productos",
      url: "/",
      icon: BoxesIcon,
      items: [
        {
          title: "Catalogo",
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
      title: "Busqueda",
      url: "/search?q=producto",
      icon: SearchIcon,
    },
    {
      title: "Configuracion",
      url: "/webhooks",
      icon: Settings2Icon,
    },
  ],
  navSecondary: [
    {
      title: "Webhooks",
      url: "/webhooks",
      icon: WebhookIcon,
    },
    {
      title: "Ayuda",
      url: "#",
      icon: LifeBuoyIcon,
    },
    {
      title: "Feedback",
      url: "#",
      icon: SendIcon,
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

  return (
    <>
      <Sidebar className="authenticated-sidebar-theme" variant="inset">
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
              {data.navMain.map((item) => (
                <Collapsible
                  asChild
                  defaultOpen={
                    item.title === "Productos" ? productsSectionActive : false
                  }
                  key={item.title}
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
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url.split("?")[0]}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
