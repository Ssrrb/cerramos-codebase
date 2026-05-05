import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@repo/design-system/components/ui/card";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import {
  ArrowRight,
  Package,
  ReceiptText,
  Repeat,
  Store,
  Truck,
} from "lucide-react";
import type {
  CustomerTrackingAction,
  CustomerTrackingItemViewModel,
  CustomerTrackingTimelineEntry,
  CustomerTrackingTone,
} from "./types";

const toneClassNames: Record<CustomerTrackingTone, string> = {
  danger: "border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-300",
  info: "border-sky-500/20 bg-sky-500/8 text-sky-700 dark:text-sky-300",
  neutral:
    "border-border/70 bg-muted/45 text-muted-foreground dark:text-foreground/80",
  success:
    "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200",
};

function TrackingToneBadge({
  label,
  tone,
}: {
  label: string;
  tone: CustomerTrackingTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-medium text-xs",
        toneClassNames[tone]
      )}
    >
      {label}
    </span>
  );
}

function ActionButton({
  action,
  primary = false,
}: {
  action: CustomerTrackingAction;
  primary?: boolean;
}) {
  const variant = action.variant ?? (primary ? "default" : "outline");

  return (
    <Button asChild size="sm" variant={variant}>
      <a href={action.href}>
        {action.label}
        {primary ? <ArrowRight className="size-4" /> : null}
      </a>
    </Button>
  );
}

function TimelineChip({ entry }: { entry: CustomerTrackingTimelineEntry }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
        {entry.label}
      </p>
      <p className="mt-1 font-medium text-sm">{entry.value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="text-sm leading-6">{value}</p>
    </div>
  );
}

export function CustomerTrackingCard({
  item,
}: {
  item: CustomerTrackingItemViewModel;
}) {
  const kindLabel = item.kind === "subscription" ? "Subscription" : "Order";
  const kindIcon =
    item.kind === "subscription" ? (
      <Repeat className="size-4" />
    ) : (
      <Package className="size-4" />
    );

  return (
    <Card className="overflow-hidden rounded-[1.35rem] border-border/70 bg-background/95 py-0 shadow-xs">
      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="gap-1 rounded-full font-medium"
                variant="outline"
              >
                {kindIcon}
                {kindLabel}
              </Badge>
              <Badge className="rounded-full font-normal" variant="secondary">
                {item.reference}
              </Badge>
              <TrackingToneBadge
                label={item.status.label}
                tone={item.status.tone}
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-lg tracking-tight">
                {item.title}
              </h3>
              {item.subtitle ? (
                <p className="text-muted-foreground text-sm leading-6">
                  {item.subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Store className="size-4" />
                {item.merchantLabel}
              </span>
              <span className="font-semibold text-base">
                {item.amountLabel}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-muted/35 p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
              Estado actual
            </p>
            <p className="mt-2 font-medium text-sm">{item.status.label}</p>
            {item.status.detail ? (
              <p className="mt-1 text-muted-foreground text-sm leading-6">
                {item.status.detail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {item.timeline.map((entry) => (
            <TimelineChip entry={entry} key={`${item.id}-${entry.label}`} />
          ))}
        </div>

        <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/25 p-4 md:grid-cols-2">
          {item.kind === "subscription" ? (
            <>
              <DetailBlock
                label="Cadencia"
                value={item.subscriptionDetails?.cadenceLabel}
              />
              <DetailBlock
                label="Próximo cobro"
                value={item.subscriptionDetails?.nextChargeLabel}
              />
              <DetailBlock
                label="Renovación"
                value={item.subscriptionDetails?.renewalStatus}
              />
              <DetailBlock
                label="Gestión"
                value={
                  item.subscriptionDetails?.managementEligible
                    ? "Disponible desde tu proveedor de cobro o desde el comercio."
                    : undefined
                }
              />
            </>
          ) : (
            <>
              <DetailBlock
                label="Entrega"
                value={item.orderDetails?.fulfillmentStatus}
              />
              <DetailBlock
                label="Seguimiento"
                value={item.orderDetails?.trackingMilestone}
              />
              <DetailBlock
                label="Nota"
                value={item.orderDetails?.deliveryNote}
              />
              <DetailBlock
                label="Recompra"
                value={
                  item.orderDetails?.reorderEligible
                    ? "Podés volver a comprar este producto si sigue disponible."
                    : undefined
                }
              />
            </>
          )}
        </div>
      </CardContent>

      {(item.primaryAction || item.secondaryActions?.length) && (
        <>
          <Separator />
          <CardFooter className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
              {item.kind === "subscription" ? (
                <ReceiptText className="size-4" />
              ) : (
                <Truck className="size-4" />
              )}
              Acciones de bajo riesgo para seguir esta compra.
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {item.secondaryActions?.map((action) => (
                <ActionButton
                  action={action}
                  key={`${item.id}-${action.label}`}
                />
              ))}
              {item.primaryAction ? (
                <ActionButton action={item.primaryAction} primary />
              ) : null}
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
