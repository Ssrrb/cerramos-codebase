"use client";

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CerramosLogo } from "./cerramos-logo";

const authNavigation = {
  "/sign-in": {
    ctaHref: "/sign-up",
    ctaLabel: "Sign Up",
  },
  "/sign-up": {
    ctaHref: "/sign-in",
    ctaLabel: "Log In",
  },
} as const;

export const AuthChrome = () => {
  const pathname = usePathname();
  const navigation =
    authNavigation[pathname as keyof typeof authNavigation] ??
    authNavigation["/sign-in"];

  return (
    <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-7 sm:py-5">
      <Link
        aria-label="Cerramos"
        className="inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        href="/sign-in"
      >
        <CerramosLogo className="h-4 text-foreground sm:h-[18px]" />
        <span
          className={cn(
            "font-semibold text-[15px] tracking-[-0.02em]",
            "text-foreground"
          )}
        >
          cerramos
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <div className="rounded-full border border-border/70 bg-background/80 p-0.5 shadow-sm backdrop-blur-sm">
          <ModeToggle />
        </div>
        <Button
          asChild
          className="h-9 rounded-xl border-border/80 bg-background/70 px-4 text-sm shadow-sm backdrop-blur-sm"
          variant="outline"
        >
          <Link href={navigation.ctaHref}>{navigation.ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
};
