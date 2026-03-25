"use client";

import { signOut } from "@repo/auth/client";
import type { ActiveCommerce } from "@repo/auth/utils";
import { ChevronUp, LogOut, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export interface SidebarAccountUser {
  email: string;
  image?: string | null;
  name?: string | null;
}

interface SidebarAccountMenuProps {
  activeCommerce: Pick<ActiveCommerce, "name" | "role" | "slug">;
  user: SidebarAccountUser;
}

const SidebarAccountMenu = ({ activeCommerce, user }: SidebarAccountMenuProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const displayName = user.name?.trim() || user.email;

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <User2 />
            <div className="min-w-0 text-left">
              <div className="truncate font-medium">{displayName}</div>
              <div className="truncate text-muted-foreground text-xs">
                {activeCommerce.name}
              </div>
            </div>
            <ChevronUp className="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-60">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate font-normal text-muted-foreground text-xs">
              {user.email}
            </span>
            <span className="truncate font-normal text-muted-foreground text-xs">
              {activeCommerce.name} / {activeCommerce.slug}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isPending} onClick={handleSignOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export default SidebarAccountMenu;
