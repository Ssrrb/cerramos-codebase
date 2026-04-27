import {
  type MerchantOrder,
  type OrdersFilter,
  OrdersPage,
} from "@repo/design-system/components/orders";
import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";

const baseOrders: MerchantOrder[] = [
  {
    id: "order_2048",
    reference: "ORD-2048",
    orderStatus: "paid",
    paymentStatus: "paid",
    customerName: "Camila Ferreira",
    customerContact: "camila@cerramos.com · 0981 123 456",
    productTitle: "Set matero de acero con bombilla",
    productSubtitle: "Negro mate / 1 litro",
    fulfillmentLabel: "Entrega a domicilio",
    totalLabel: "Gs. 145.000",
    createdAtLabel: "Hoy, 14:35",
    expiresAtLabel: "Mañana, 14:35",
    note: "Recibir después de las 18:00.",
  },
  {
    id: "order_2049",
    reference: "ORD-2049",
    orderStatus: "new",
    paymentStatus: "not_required",
    customerName: "Luis Arce",
    customerContact: "luis.arce@example.com · 0972 310 440",
    productTitle: "Caja de alfajores surtidos",
    productSubtitle: "Pack familiar / 24 unidades",
    fulfillmentLabel: "Retiro en tienda",
    totalLabel: "Gs. 88.000",
    createdAtLabel: "Hoy, 13:10",
    expiresAtLabel: "Mañana, 13:10",
  },
  {
    id: "order_2050",
    reference: "ORD-2050",
    orderStatus: "pending_payment",
    paymentStatus: "pending",
    customerName: "Martina Rojas",
    customerContact: "martina@ejemplo.com · 0994 220 150",
    productTitle: "Plan Growth mensual",
    productSubtitle: "Suscripción operativa",
    fulfillmentLabel: "Sin entrega física",
    totalLabel: "Gs. 89.000",
    createdAtLabel: "Hoy, 11:42",
    expiresAtLabel: "Mañana, 11:42",
    note: "Esperando autorización del medio de pago.",
  },
  {
    id: "order_2051",
    reference: "ORD-2051",
    orderStatus: "confirmed",
    paymentStatus: "authorized",
    customerName: "Paola Medina",
    customerContact: "paola.medina@example.com",
    productTitle: "Asesoría express de catálogo",
    productSubtitle: "Videollamada / 45 min",
    fulfillmentLabel: "Coordinación directa",
    totalLabel: "Gs. 220.000",
    createdAtLabel: "Ayer, 16:20",
  },
  {
    id: "order_2052",
    reference: "ORD-2052",
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    customerName: "Diego Cáceres",
    customerContact: "diego@example.com · 0983 900 221",
    productTitle: "Kit de bienvenida comercial",
    productSubtitle: "Personalizado con marca",
    fulfillmentLabel: "Entrega a domicilio",
    totalLabel: "Gs. 310.000",
    createdAtLabel: "Ayer, 10:05",
    note: "Cancelado por falta de stock.",
  },
  {
    id: "order_2053",
    reference: "ORD-2053",
    orderStatus: "expired",
    paymentStatus: "failed",
    customerName: "Cliente sin nombre",
    customerContact: "compras@ejemplo.com",
    productTitle: "Bolso organizador para pedidos",
    fulfillmentLabel: "Retiro en tienda",
    totalLabel: "Gs. 120.000",
    createdAtLabel: "22 abr, 09:15",
    expiresAtLabel: "23 abr, 09:15",
  },
];

const meta = {
  title: "commerce/OrdersPage",
  component: OrdersPage,
  tags: ["autodocs"],
  args: {
    orders: baseOrders,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OrdersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function OrdersPageStory({
  defaultFilter = "all",
  initialOrders = baseOrders,
  initialUpdatingOrderIds = [],
}: {
  defaultFilter?: OrdersFilter;
  initialOrders?: MerchantOrder[];
  initialUpdatingOrderIds?: string[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState<OrdersFilter>(defaultFilter);
  const [updatingOrderIds, setUpdatingOrderIds] = useState(
    initialUpdatingOrderIds
  );

  const summary = useMemo(
    () => [
      {
        label: "Total",
        value: String(orders.length),
        description: "pedidos del comercio",
      },
      {
        label: "Pendientes",
        value: String(
          orders.filter((order) =>
            ["new", "pending_payment", "paid"].includes(order.orderStatus)
          ).length
        ),
        description: "pueden completarse o cancelarse",
      },
      {
        label: "Completados",
        value: String(
          orders.filter((order) => order.orderStatus === "confirmed").length
        ),
        description: "aceptados por comercio",
      },
    ],
    [orders]
  );

  const updateOrderStatus = (
    orderId: string,
    nextStatus: "confirmed" | "cancelled"
  ) => {
    setUpdatingOrderIds((current) => [...new Set([...current, orderId])]);

    window.setTimeout(() => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus: nextStatus,
                note:
                  nextStatus === "confirmed"
                    ? "Pedido marcado como completado desde Storybook."
                    : "Pedido cancelado desde Storybook.",
              }
            : order
        )
      );
      setUpdatingOrderIds((current) => current.filter((id) => id !== orderId));
    }, 450);
  };

  return (
    <OrdersPage
      activeFilter={activeFilter}
      footerContent="Storybook usa estado local para simular los cambios de pedido."
      onCancelOrder={(orderId) => updateOrderStatus(orderId, "cancelled")}
      onCompleteOrder={(orderId) => updateOrderStatus(orderId, "confirmed")}
      onFilterChange={setActiveFilter}
      orders={orders}
      summary={summary}
      updatingOrderIds={updatingOrderIds}
    />
  );
}

export const AllOrders: Story = {
  render: () => <OrdersPageStory />,
};

export const ActionablePending: Story = {
  render: () => (
    <OrdersPageStory
      defaultFilter="actionable"
      initialOrders={baseOrders.filter((order) =>
        ["new", "pending_payment", "paid"].includes(order.orderStatus)
      )}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <OrdersPage
      emptyDescription="Cuando el comercio reciba pedidos desde links de venta, podrá verlos y operarlos desde esta vista."
      emptyTitle="No hay pedidos para revisar"
      orders={[]}
    />
  ),
};

export const Updating: Story = {
  render: () => <OrdersPageStory initialUpdatingOrderIds={["order_2048"]} />,
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => (
    <div className="mx-auto max-w-[390px]">
      <OrdersPageStory />
    </div>
  ),
};
