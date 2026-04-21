"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

interface NonDistractingFooterProps {
  children?: ReactNode;
  className?: string;
}

export const NonDistractingFooter = ({
  className,
  children,
}: NonDistractingFooterProps) => {
  return (
    <footer
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 border-border/70 border-t bg-[color-mix(in_oklab,var(--color-background)_94%,var(--color-muted)_6%)] px-4 py-8 text-muted-foreground",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {children}

        <div className="flex items-center gap-4 font-medium text-xs">
          <a className="transition-colors hover:text-foreground" href="/terms">
            Terms of Service
          </a>
          <span className="text-border">•</span>
          <a
            className="transition-colors hover:text-foreground"
            href="/privacy"
          >
            Privacy Policy
          </a>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 uppercase tracking-wider">
          <Lock className="h-3 w-3" />
          <span>Secure Checkout</span>
        </div>

        <div className="text-muted-foreground/70 text-xs">
          © {new Date().getFullYear()} Cerramos Inc.
        </div>
      </div>
    </footer>
  );
};
