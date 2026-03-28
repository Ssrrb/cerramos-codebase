import { LockKeyholeIcon } from "lucide-react"

import { cn } from "@repo/design-system/lib/utils"

interface CheckoutHeaderProps {
  className?: string
  secureLabel?: string
}

function CheckoutHeader({
  className,
  secureLabel = "Checkout seguro",
}: CheckoutHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-background px-4 py-3 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-foreground font-semibold text-background text-sm tracking-tight">
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
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-muted-foreground text-xs">
          <LockKeyholeIcon />
          <span>{secureLabel}</span>
        </div>
      </div>
    </header>
  )
}

export { CheckoutHeader }
