"use client";

import type { ActiveCommerce } from "@repo/auth/utils";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

interface NavbarProps {
  activeCommerce: Pick<ActiveCommerce, "name" | "role" | "slug">;
}

const Navbar = ({ activeCommerce }: NavbarProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between bg-background p-4">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="min-w-0">
          <div className="truncate font-medium text-sm">
            {activeCommerce.name}
          </div>
          <div className="truncate text-muted-foreground text-xs">
            /{activeCommerce.slug}
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href="/">Dashboard</Link>
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* USER MENU */}
      </div>
    </nav>
  );
};

export default Navbar;
