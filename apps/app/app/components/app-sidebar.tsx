"use client";

import type { ActiveCommerce } from "@repo/auth/utils";
import {
  Calendar,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  Shirt,
  ShoppingBasket,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveCommerceLogoImageSrc } from "@/lib/commerce";
import AddCategory from "./AddCategory";
import AddOrder from "./AddOrder";
import AddUser from "./AddUser";
import AddProduct from "./add-product";
import SidebarAccountMenu, {
  type SidebarAccountUser,
} from "./sidebar-account-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetTrigger } from "./ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";

const items = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Bandeja",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendario",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Buscar",
    url: "#",
    icon: Search,
  },
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
  },
];

interface AppSidebarProps {
  activeCommerce: Pick<
    ActiveCommerce,
    "id" | "logoImageUrl" | "name" | "role" | "slug"
  >;
  user: SidebarAccountUser;
}

const AppSidebar = ({ activeCommerce, user }: AppSidebarProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const commerceInitial =
    activeCommerce.name.trim().charAt(0).toUpperCase() || "C";
  const commerceLogoSrc = resolveCommerceLogoImageSrc(
    activeCommerce.logoImageUrl,
    process.env.NEXT_PUBLIC_GCS_BUCKET_NAME ?? process.env.GCS_BUCKET_NAME
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div aria-hidden className="hidden w-64 shrink-0 md:block" />;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Avatar className="size-5 rounded-md">
                  <AvatarImage
                    alt={activeCommerce.name}
                    src={commerceLogoSrc ?? undefined}
                  />
                  <AvatarFallback className="rounded-md text-[0.65rem]">
                    {commerceInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {activeCommerce.name}
                  </div>
                  <div className="truncate text-muted-foreground text-xs">
                    /{activeCommerce.slug}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.title === "Bandeja" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Productos</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Agregar producto</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/productos">
                    <Shirt />
                    Ver todos los productos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus />
                      Agregar producto
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddProduct />
                </Sheet>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus />
                      Agregar categoría
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddCategory />
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Usuarios</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Agregar usuario</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/clientes">
                    <User />
                    Ver todos los clientes
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus />
                      Agregar cliente
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddUser />
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pedidos / Pagos</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Agregar pedido</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/users">
                    <ShoppingBasket />
                    Ver todas las transacciones
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton>
                      <Plus />
                      Agregar pedido
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <AddOrder />
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarAccountMenu activeCommerce={activeCommerce} user={user} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
