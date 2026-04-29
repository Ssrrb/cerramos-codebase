import { Badge } from "@repo/design-system/components/ui/badge";
import { cn } from "@repo/design-system/lib/utils";
import {
  CircleDollarSign,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  TimerOff,
  WalletCards,
  XCircle,
} from "lucide-react";
import type { PaymentStatus } from "./types";

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    className: string;
    icon: typeof CreditCard;
    label: string;
  }
> = {
  not_required: {
    className: "border-muted-foreground/20 bg-muted/50 text-muted-foreground",
    icon: WalletCards,
    label: "Sin cobro",
  },
  pending: {
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: CreditCard,
    label: "Pago pendiente",
  },
  authorized: {
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: ShieldCheck,
    label: "Autorizado",
  },
  paid: {
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CircleDollarSign,
    label: "Pagado",
  },
  failed: {
    className:
      "border-destructive/25 bg-destructive/10 text-destructive dark:text-red-300",
    icon: CreditCard,
    label: "Fallido",
  },
  expired: {
    className: "border-muted-foreground/20 bg-muted text-muted-foreground",
    icon: TimerOff,
    label: "Expirado",
  },
  cancelled: {
    className:
      "border-destructive/25 bg-destructive/10 text-destructive dark:text-red-300",
    icon: XCircle,
    label: "Cancelado",
  },
  refunded: {
    className: "border-muted-foreground/25 bg-muted text-muted-foreground",
    icon: RotateCcw,
    label: "Reembolsado",
  },
};

export function PaymentStatusBadge({
  className,
  status,
}: {
  className?: string;
  status: PaymentStatus;
}) {
  const config = paymentStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "h-7 border px-2.5 font-medium",
        config.className,
        className
      )}
      variant="outline"
    >
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}

export { paymentStatusConfig };
