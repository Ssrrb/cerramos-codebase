import { Button } from "@repo/design-system/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import { Check, LoaderCircle, X } from "lucide-react";
import type { OrderStatus } from "./types";

export const actionableOrderStatuses: OrderStatus[] = [
  "new",
  "pending_payment",
  "paid",
];

export const isActionableOrderStatus = (status: OrderStatus) =>
  actionableOrderStatuses.includes(status);

export function OrderActions({
  disabled = false,
  isUpdating = false,
  onCancel,
  onComplete,
  orderStatus,
}: {
  disabled?: boolean;
  isUpdating?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
  orderStatus: OrderStatus;
}) {
  if (!isActionableOrderStatus(orderStatus)) {
    return (
      <span className="text-muted-foreground text-xs">
        Sin acciones pendientes
      </span>
    );
  }

  const isDisabled = disabled || isUpdating;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Marcar completo"
            disabled={isDisabled}
            onClick={onComplete}
            size="sm"
            type="button"
          >
            {isUpdating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            <span className="hidden sm:inline">Marcar completo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Confirma que el pedido quedó aceptado.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Cancelar"
            disabled={isDisabled}
            onClick={onCancel}
            size="sm"
            type="button"
            variant="outline"
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Cancelar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cancela el pedido operativo.</TooltipContent>
      </Tooltip>
    </div>
  );
}
