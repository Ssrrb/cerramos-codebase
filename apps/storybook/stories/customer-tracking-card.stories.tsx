import {
  CustomerTrackingCard,
  type CustomerTrackingItemViewModel,
} from "@repo/design-system/components/customer-ordenes";
import type { Meta, StoryObj } from "@storybook/react";

const orderItem: CustomerTrackingItemViewModel = {
  amountLabel: "Gs. 145.000",
  id: "order_1",
  kind: "order",
  merchantLabel: "Mate Shop",
  occurredAt: "2026-04-28T16:00:00.000Z",
  orderDetails: {
    deliveryNote: "Recibir después de las 18:00.",
    fulfillmentStatus: "Entrega a domicilio",
    reorderEligible: true,
    trackingMilestone: "Pago aprobado y comercio preparando el pedido.",
  },
  primaryAction: {
    href: "/es/buy/mate-shop/mate-premium",
    label: "Volver a comprar",
  },
  reference: "ORD-2048",
  secondaryActions: [
    {
      href: "/es/account/ordenes#order_1",
      label: "Ver detalles",
      variant: "ghost",
    },
  ],
  status: {
    detail: "El comercio confirmó el pedido y lo está preparando.",
    label: "En preparación",
    tone: "info",
  },
  subtitle: "Negro mate / 1 litro",
  timeline: [
    { label: "Compra", value: "28 abr 2026" },
    { label: "Última novedad", value: "29 abr, 14:10" },
    { label: "Entrega estimada", value: "30 abr 2026" },
  ],
  title: "Set matero de acero",
};

const subscriptionItem: CustomerTrackingItemViewModel = {
  amountLabel: "Gs. 89.000",
  id: "sub_1",
  kind: "subscription",
  merchantLabel: "Plan Growth",
  occurredAt: "2026-04-20T12:00:00.000Z",
  primaryAction: {
    href: "/es/buy/plan-growth/growth-mensual",
    label: "Gestionar suscripción",
  },
  reference: "SUB-0301",
  secondaryActions: [
    {
      href: "/es/buy/plan-growth/growth-mensual",
      label: "Ver plan",
      variant: "ghost",
    },
  ],
  status: {
    detail: "La suscripción sigue activa y renovará automáticamente.",
    label: "Activa",
    tone: "success",
  },
  subtitle: "Operación mensual",
  subscriptionDetails: {
    cadenceLabel: "Mensual",
    managementEligible: true,
    nextChargeLabel: "20 may 2026",
    renewalStatus: "Renovación automática activa",
  },
  timeline: [
    { label: "Alta", value: "20 abr 2026" },
    { label: "Última novedad", value: "20 abr, 12:00" },
    { label: "Próximo cobro", value: "20 may 2026" },
  ],
  title: "Plan Growth mensual",
};

const meta = {
  title: "commerce/customer-tracking-card",
  component: CustomerTrackingCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CustomerTrackingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrderMode: Story = {
  args: {
    item: orderItem,
  },
};

export const SubscriptionMode: Story = {
  args: {
    item: subscriptionItem,
  },
};
