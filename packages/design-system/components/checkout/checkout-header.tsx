import { cn } from "@repo/design-system/lib/utils";
import { LockKeyholeIcon } from "lucide-react";
import { CheckoutUserIdentity } from "./checkout-user-identity";

interface CheckoutHeaderProps {
  className?: string;
  secureLabel?: string;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

function CheckoutHeader({
  className,
  secureLabel = "Checkout seguro",
  user,
}: CheckoutHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-background px-4 py-3 shadow-xs sm:px-5 sm:py-3.5",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-foreground font-semibold text-background text-sm tracking-tight sm:size-11">
            C
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-base text-foreground">
              Cerramos
            </span>
            <span className="text-muted-foreground text-xs">
              Compra simple y sin distracciones
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckoutUserIdentity user={user} />
          <div className="flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-muted-foreground text-xs">
            <LockKeyholeIcon className="size-4" />
            <span>{secureLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export { CheckoutHeader };
