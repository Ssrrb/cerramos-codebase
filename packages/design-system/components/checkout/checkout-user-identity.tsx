"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { LogOut, MapPin } from "lucide-react";

interface CheckoutUserIdentityProps {
  className?: string;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

function CheckoutUserIdentity({ user, className }: CheckoutUserIdentityProps) {
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 outline-none transition-opacity hover:opacity-80",
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-2 rounded-full bg-muted/50 py-1 pr-2 pl-1">
          <Avatar className="size-6">
            <AvatarImage alt={user.name} src={user.avatarUrl} />
            <AvatarFallback className="text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[80px] truncate font-medium text-muted-foreground text-xs">
            {user.name}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer">
          <MapPin className="size-4" />
          <span>Saved addresses</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="size-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { CheckoutUserIdentity };
