"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Separator } from "@repo/design-system/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { cn } from "@repo/design-system/lib/utils";
import { ClipboardList, Inbox } from "lucide-react";
import { useMemo } from "react";
import { isActionableOrderStatus, OrderActions } from "./order-actions";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import type { MerchantOrder, OrdersFilter, OrdersPageProps } from "./types";

const orderFilterOptions: {
  label: string;
  value: OrdersFilter;
}[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "actionable" },
  { label: "Completados", value: "confirmed" },
  { label: "Cancelados", value: "cancelled" },
  { label: "Expirados", value: "expired" },
];

const getFilteredOrders = (orders: MerchantOrder[], filter: OrdersFilter) => {
  if (filter === "all") {
    return orders;
  }

  if (filter === "actionable") {
    return orders.filter((order) => isActionableOrderStatus(order.orderStatus));
  }

  return orders.filter((order) => order.orderStatus === filter);
};

const getFilterCount = (orders: MerchantOrder[], filter: OrdersFilter) =>
  getFilteredOrders(orders, filter).length;

function OrderMeta({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <span className="text-muted-foreground text-xs">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </span>
  );
}

function OrdersMobileCard({
  isUpdating,
  onCancelOrder,
  onCompleteOrder,
  order,
}: {
  isUpdating: boolean;
  onCancelOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  order: MerchantOrder;
}) {
  return (
    <article className="rounded-lg border border-border/70 bg-background p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-sm leading-5">{order.productTitle}</p>
          {order.productSubtitle ? (
            <p className="text-muted-foreground text-sm">
              {order.productSubtitle}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 font-semibold text-sm">
          {order.totalLabel}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.orderStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      <Separator className="my-4" />
      <div className="grid gap-2 text-sm">
        <div>
          <p className="font-medium">{order.customerName}</p>
          {order.customerContact ? (
            <p className="text-muted-foreground">{order.customerContact}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <OrderMeta label="Pedido" value={order.reference} />
          <OrderMeta label="Entrega" value={order.fulfillmentLabel} />
          <OrderMeta label="Creado" value={order.createdAtLabel} />
          <OrderMeta label="Vence" value={order.expiresAtLabel} />
        </div>
        {order.note ? (
          <p className="rounded-md bg-muted/45 px-3 py-2 text-muted-foreground text-xs">
            {order.note}
          </p>
        ) : null}
      </div>
      <div className="mt-4">
        <OrderActions
          isUpdating={isUpdating}
          onCancel={() => onCancelOrder?.(order.id)}
          onComplete={() => onCompleteOrder?.(order.id)}
          orderStatus={order.orderStatus}
        />
      </div>
    </article>
  );
}

function OrdersTable({
  onCancelOrder,
  onCompleteOrder,
  orders,
  updatingOrderIds,
}: {
  onCancelOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  orders: MerchantOrder[];
  updatingOrderIds: string[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-64">Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Estados</TableHead>
          <TableHead>Entrega</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isUpdating = updatingOrderIds.includes(order.id);

          return (
            <TableRow key={order.id}>
              <TableCell className="align-top">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.productTitle}</span>
                    <Badge className="font-normal" variant="outline">
                      {order.reference}
                    </Badge>
                  </div>
                  {order.productSubtitle ? (
                    <p className="text-muted-foreground text-sm">
                      {order.productSubtitle}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    Creado {order.createdAtLabel}
                  </p>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{order.customerName}</p>
                  {order.customerContact ? (
                    <p className="text-muted-foreground text-sm">
                      {order.customerContact}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col items-start gap-2">
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="max-w-44 space-y-1 text-sm">
                  <p>{order.fulfillmentLabel}</p>
                  {order.expiresAtLabel ? (
                    <p className="text-muted-foreground text-xs">
                      Vence {order.expiresAtLabel}
                    </p>
                  ) : null}
                  {order.note ? (
                    <p className="text-muted-foreground text-xs">
                      {order.note}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right align-top font-semibold">
                {order.totalLabel}
              </TableCell>
              <TableCell className="align-top">
                <OrderActions
                  isUpdating={isUpdating}
                  onCancel={() => onCancelOrder?.(order.id)}
                  onComplete={() => onCompleteOrder?.(order.id)}
                  orderStatus={order.orderStatus}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function OrdersPage({
  activeFilter = "all",
  className,
  description = "Revisá pedidos, pagos y preparación sin mezclar el estado operativo con el estado de cobro.",
  emptyDescription = "Cuando entren pedidos desde links de venta, van a aparecer acá con el contexto necesario para confirmarlos o cancelarlos.",
  emptyTitle = "Todavía no hay pedidos",
  footerContent,
  onCancelOrder,
  onCompleteOrder,
  onFilterChange,
  orders,
  summary,
  title = "Pedidos",
  updatingOrderIds = [],
}: OrdersPageProps) {
  const filteredOrders = useMemo(
    () => getFilteredOrders(orders, activeFilter),
    [activeFilter, orders]
  );

  const defaultSummary = useMemo(
    () => [
      {
        label: "Total",
        value: String(orders.length),
        description: "pedidos visibles",
      },
      {
        label: "Pendientes",
        value: String(getFilterCount(orders, "actionable")),
        description: "requieren decisión",
      },
      {
        label: "Completados",
        value: String(getFilterCount(orders, "confirmed")),
        description: "aceptados por comercio",
      },
    ],
    [orders]
  );

  const summaryItems = summary ?? defaultSummary;

  return (
    <section
      className={cn(
        "min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_42%,var(--color-background)_58%)_0%,var(--color-background)_24rem)] px-4 py-6 text-foreground sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-background shadow-xs">
                <ClipboardList className="size-4" />
              </div>
              <p className="font-medium text-muted-foreground text-sm">
                Operación comercial
              </p>
            </div>
            <div className="space-y-2">
              <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm leading-6">
                {description}
              </p>
            </div>
          </div>
          {summaryItems.length ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
              {summaryItems.map((item) => (
                <div
                  className="rounded-lg border border-border/70 bg-background px-4 py-3 shadow-xs"
                  key={item.label}
                >
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="mt-1 font-semibold text-2xl tracking-tight">
                    {item.value}
                  </p>
                  {item.description ? (
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </header>

        <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-xs">
          <CardHeader className="gap-4 border-border/70 border-b px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-base">Listado de pedidos</CardTitle>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {orderFilterOptions.map((option) => {
                  const isActive = option.value === activeFilter;

                  return (
                    <Button
                      aria-pressed={isActive}
                      className={cn(
                        "h-8 shrink-0 rounded-md px-3 text-xs",
                        isActive && "border-foreground/20 bg-accent"
                      )}
                      key={option.value}
                      onClick={() => onFilterChange?.(option.value)}
                      size="sm"
                      type="button"
                      variant={isActive ? "secondary" : "outline"}
                    >
                      {option.label}
                      <span className="text-muted-foreground">
                        {getFilterCount(orders, option.value)}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length ? (
              <>
                <div className="grid gap-3 p-4 md:hidden">
                  {filteredOrders.map((order) => (
                    <OrdersMobileCard
                      isUpdating={updatingOrderIds.includes(order.id)}
                      key={order.id}
                      onCancelOrder={onCancelOrder}
                      onCompleteOrder={onCompleteOrder}
                      order={order}
                    />
                  ))}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <OrdersTable
                    onCancelOrder={onCancelOrder}
                    onCompleteOrder={onCompleteOrder}
                    orders={filteredOrders}
                    updatingOrderIds={updatingOrderIds}
                  />
                </div>
              </>
            ) : (
              <Empty className="min-h-[24rem] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>{emptyTitle}</EmptyTitle>
                  <EmptyDescription>{emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
        {footerContent ? (
          <div className="text-muted-foreground text-sm">{footerContent}</div>
        ) : null}
      </div>
    </section>
  );
}
