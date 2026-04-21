"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { CerramosLogo } from "../registration/cerramos-logo";

interface NonDistractingHeaderProps {
  /** Optional action for account management (e.g., "Sign in to use saved info") */
  accountAction?: ReactNode;
  className?: string;
}

export const NonDistractingHeader = ({
  className,
  accountAction,
}: NonDistractingHeaderProps) => {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center justify-between border-border/70 border-b bg-[color-mix(in_oklab,var(--color-background)_92%,var(--color-muted)_8%)] px-4 text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <CerramosLogo className="h-6 w-auto text-foreground" />
      </div>

      <div className="flex items-center gap-6">
        {accountAction && (
          <div className="flex items-center font-medium text-muted-foreground text-xs">
            {accountAction}
          </div>
        )}

        <div className="flex items-center">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};
