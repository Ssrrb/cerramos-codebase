import {
  CustomerOrdenesPage,
  CustomerOrdenesSkeleton,
  type CustomerTrackingItemViewModel,
} from "@repo/design-system/components/customer-ordenes";
import type { Meta, StoryObj } from "@storybook/react";

const items: CustomerTrackingItemViewModel[] = [
  {
    amountLabel: "Gs. 145.000",
    id: "order_1",
    kind: "order",
    merchantLabel: "Mate Shop",
    occurredAt: "2026-04-28T16:00:00.000Z",
    orderDetails: {
      deliveryNote: "Entregar después de las 18:00.",
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
  },
  {
    amountLabel: "Gs. 88.000",
    id: "order_2",
    kind: "order",
    merchantLabel: "Dulce Central",
    occurredAt: "2026-04-12T10:00:00.000Z",
    orderDetails: {
      fulfillmentStatus: "Retiro coordinado",
      reorderEligible: true,
      trackingMilestone: "El pago necesita una nueva revisión.",
    },
    primaryAction: {
      href: "/es/buy/dulce-central/alfajores-family",
      label: "Completar compra",
    },
    reference: "ORD-2090",
    status: {
      detail: "El cobro no terminó de autorizarse.",
      label: "Acción pendiente",
      tone: "warning",
    },
    subtitle: "Pack familiar / 24 unidades",
    timeline: [
      { label: "Compra", value: "12 abr 2026" },
      { label: "Última novedad", value: "12 abr, 10:18" },
      { label: "Vencimiento", value: "13 abr 2026" },
    ],
    title: "Caja de alfajores surtidos",
  },
  {
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
    subscriptionDetails: {
      cadenceLabel: "Mensual",
      managementEligible: true,
      nextChargeLabel: "20 may 2026",
      renewalStatus: "Renovación automática activa",
    },
    subtitle: "Operación mensual",
    timeline: [
      { label: "Alta", value: "20 abr 2026" },
      { label: "Última novedad", value: "20 abr, 12:00" },
      { label: "Próximo cobro", value: "20 may 2026" },
    ],
    title: "Plan Growth mensual",
  },
];

const meta = {
  title: "commerce/customer-ordenes-page",
  component: CustomerOrdenesPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CustomerOrdenesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultPopulated: Story = {
  args: {
    breadcrumbItems: [
      { href: "/es", label: "Inicio" },
      { label: "Cuenta" },
      { label: "Órdenes" },
    ],
    items,
    recommendations: [
      {
        action: {
          href: "/es/buy/mate-shop/mate-premium",
          label: "Volver a comprar",
        },
        badgeLabel: "Order",
        description: "La compra más repetida del último mes.",
        id: "recommendation_1",
        priceLabel: "Gs. 145.000",
        title: "Set matero de acero",
      },
      {
        action: {
          href: "/es/buy/plan-growth/growth-mensual",
          label: "Abrir plan",
        },
        badgeLabel: "Subscription",
        description: "El plan mensual sigue vigente y listo para retomarlo.",
        id: "recommendation_2",
        priceLabel: "Gs. 89.000",
        title: "Plan Growth mensual",
      },
    ],
    summary: [
      { description: "órdenes y suscripciones", label: "Total", value: "3" },
      { description: "todavía activas", label: "Activas", value: "2" },
      { description: "requieren atención", label: "Atención", value: "1" },
    ],
    title: "Tus órdenes",
  },
};

export const MixedUnifiedList: Story = {
  args: DefaultPopulated.args,
};

export const SearchFilterNarrowed: Story = {
  args: {
    ...DefaultPopulated.args,
    initialActiveFilter: "subscriptions",
    initialSearchTerm: "Growth",
  },
};

export const EmptyFirstTimeCustomer: Story = {
  args: {
    emptyState: {
      action: {
        href: "/es",
        label: "Explorar productos",
      },
      description:
        "Tu primer pedido o suscripción aparecerá acá con su estado y próximos pasos.",
      title: "Todavía no tenés actividad",
    },
    items: [],
    title: "Tus órdenes",
  },
};

export const ErrorState: Story = {
  args: {
    errorState: {
      action: {
        href: "/es/account/ordenes",
        label: "Volver a intentar",
      },
      description: "No pudimos cargar el historial en este momento.",
      title: "Hubo un problema al recuperar tu cuenta",
    },
    items: [],
    showErrorState: true,
    title: "Tus órdenes",
  },
};

export const LoadingState: Story = {
  render: () => <CustomerOrdenesSkeleton />,
};

export const MobileStackedLayout: Story = {
  args: DefaultPopulated.args,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
