import { Badge } from "@repo/design-system/components/ui/badge";
import { cn } from "@repo/design-system/lib/utils";
import { CheckCircle2, Clock3, TimerOff, XCircle } from "lucide-react";
import type { OrderStatus } from "./types";

const orderStatusConfig: Record<
  OrderStatus,
  {
    className: string;
    icon: typeof Clock3;
    label: string;
  }
> = {
  new: {
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: Clock3,
    label: "Pendiente",
  },
  pending_payment: {
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: Clock3,
    label: "Pago pendiente",
  },
  paid: {
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
    label: "Listo para confirmar",
  },
  confirmed: {
    className:
      "border-foreground/15 bg-foreground/10 text-foreground dark:bg-foreground/15",
    icon: CheckCircle2,
    label: "Completado",
  },
  cancelled: {
    className:
      "border-destructive/25 bg-destructive/10 text-destructive dark:text-red-300",
    icon: XCircle,
    label: "Cancelado",
  },
  expired: {
    className: "border-muted-foreground/20 bg-muted text-muted-foreground",
    icon: TimerOff,
    label: "Expirado",
  },
};

export function OrderStatusBadge({
  className,
  status,
}: {
  className?: string;
  status: OrderStatus;
}) {
  const config = orderStatusConfig[status];
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

export { orderStatusConfig };
