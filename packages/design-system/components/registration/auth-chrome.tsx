"use client";

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { CerramosLogo } from "./cerramos-logo";

export interface AuthChromeProps {
  ctaHref: string;
  ctaLabel: string;
  homeHref?: string;
}

export const AuthChrome = ({
  ctaHref,
  ctaLabel,
  homeHref = "/sign-in",
}: AuthChromeProps) => (
  <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-7 sm:py-5">
    <a
      aria-label="Cerramos"
      className="inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
      href={homeHref}
    >
      <CerramosLogo className="h-4 text-foreground sm:h-[18px]" />
      <span
        className={cn(
          "font-semibold text-[15px] tracking-[-0.02em]",
          "text-foreground"
        )}
      >
        cheki
      </span>
    </a>
    <div className="flex items-center gap-2">
      <div className="rounded-full border border-border/70 bg-background/80 p-0.5 shadow-sm backdrop-blur-sm">
        <ModeToggle />
      </div>
      <Button
        asChild
        className="h-9 rounded-xl border-border/80 bg-background/70 px-4 text-sm shadow-sm backdrop-blur-sm"
        variant="outline"
      >
        <a href={ctaHref}>{ctaLabel}</a>
      </Button>
    </div>
  </div>
);
