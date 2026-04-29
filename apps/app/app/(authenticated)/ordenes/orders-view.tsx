"use client";

import {
  type MerchantOrder,
  type OrdersFilter,
  OrdersPage,
} from "@repo/design-system/components/orders";
import { useMemo, useState } from "react";

interface OrdersViewProps {
  orders: MerchantOrder[];
}

const updateOrder = async (orderId: string, action: "cancel" | "complete") => {
  const response = await fetch("/api/orders", {
    body: JSON.stringify({ action, orderId }),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    item?: MerchantOrder;
  } | null;

  if (!(response.ok && payload?.item)) {
    throw new Error(payload?.error ?? "No se pudo actualizar el pedido.");
  }

  return payload.item;
};

export function OrdersView({ orders: initialOrders }: OrdersViewProps) {
  const [activeFilter, setActiveFilter] = useState<OrdersFilter>("all");
  const [orders, setOrders] = useState(initialOrders);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(
    () => [
      {
        description: "pedidos del comercio",
        label: "Total",
        value: String(orders.length),
      },
      {
        description: "pueden completarse o cancelarse",
        label: "Pendientes",
        value: String(
          orders.filter((order) =>
            ["new", "pending_payment", "paid"].includes(order.orderStatus)
          ).length
        ),
      },
      {
        description: "aceptados por comercio",
        label: "Completados",
        value: String(
          orders.filter((order) => order.orderStatus === "confirmed").length
        ),
      },
    ],
    [orders]
  );

  const handleOrderAction = async (
    orderId: string,
    action: "cancel" | "complete"
  ) => {
    setError(null);
    setUpdatingOrderIds((current) => [...new Set([...current, orderId])]);

    try {
      const updatedOrder = await updateOrder(orderId, action);

      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo actualizar el pedido."
      );
    } finally {
      setUpdatingOrderIds((current) => current.filter((id) => id !== orderId));
    }
  };

  return (
    <OrdersPage
      activeFilter={activeFilter}
      className="-mx-4 min-h-[calc(100vh-4rem)]"
      emptyDescription="Cuando entren pedidos desde links de venta, van a aparecer acá con el contexto necesario para confirmarlos o cancelarlos."
      emptyTitle="Todavía no hay pedidos"
      footerContent={
        error ? (
          <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </p>
        ) : null
      }
      onCancelOrder={(orderId) => handleOrderAction(orderId, "cancel")}
      onCompleteOrder={(orderId) => handleOrderAction(orderId, "complete")}
      onFilterChange={setActiveFilter}
      orders={orders}
      summary={summary}
      updatingOrderIds={updatingOrderIds}
    />
  );
}
