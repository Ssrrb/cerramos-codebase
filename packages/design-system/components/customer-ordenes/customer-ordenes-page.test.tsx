import { afterEach, describe, expect, test } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { CustomerOrdenesPage } from "./customer-ordenes-page";
import { CustomerTrackingCard } from "./customer-tracking-card";
import type { CustomerTrackingItemViewModel } from "./types";

const suscripcionesTabName = /Suscripciones/i;
const todoTabName = /Todo/i;

const baseItems: CustomerTrackingItemViewModel[] = [
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
    reference: "PED-2048",
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
      { label: "Actualización", value: "Hoy, 16:20" },
      { label: "Entrega estimada", value: "Mañana" },
    ],
    title: "Set matero de acero",
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
    status: {
      detail: "Tu próxima renovación se procesará automáticamente.",
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
      { label: "Renovación", value: "20 may 2026" },
      { label: "Estado", value: "Cobro al día" },
    ],
    title: "Plan Growth mensual",
  },
];

describe("customer ordenes page", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders order and subscription cards with conditional fields", () => {
    render(
      <div>
        <CustomerTrackingCard item={baseItems[0]} />
        <CustomerTrackingCard item={baseItems[1]} />
      </div>
    );

    expect(screen.getByText("Entrega")).toBeDefined();
    expect(screen.getByText("Entrega a domicilio")).toBeDefined();
    expect(screen.getByText("Cadencia")).toBeDefined();
    expect(screen.getByText("Mensual")).toBeDefined();
    expect(screen.queryByText("Próximo cobro")).toBeDefined();
  });

  test("updates the visible list when search and filter controls change", () => {
    render(<CustomerOrdenesPage items={baseItems} />);

    expect(screen.getByText("Set matero de acero")).toBeDefined();
    expect(screen.getByText("Plan Growth mensual")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: suscripcionesTabName }));

    expect(screen.queryByText("Set matero de acero")).toBeNull();
    expect(screen.getByText("Plan Growth mensual")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: todoTabName }));
    fireEvent.change(screen.getByLabelText("Buscar en tu historial"), {
      target: { value: "Mate Shop" },
    });

    expect(screen.getByText("Set matero de acero")).toBeDefined();
    expect(screen.queryByText("Plan Growth mensual")).toBeNull();
  });

  test("renders an empty state that teaches the next action", () => {
    render(
      <CustomerOrdenesPage
        emptyState={{
          action: {
            href: "/es",
            label: "Explorar productos",
          },
          description:
            "Empezá por una compra puntual o activá tu primera suscripción.",
          title: "Todavía no tenés actividad",
        }}
        items={[]}
      />
    );

    expect(screen.getByText("Todavía no tenés actividad")).toBeDefined();
    expect(
      screen.getByText(
        "Empezá por una compra puntual o activá tu primera suscripción."
      )
    ).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Explorar productos" })
    ).toBeDefined();
  });

  test("only renders action buttons when the model exposes them", () => {
    render(
      <CustomerTrackingCard
        item={{
          ...baseItems[0],
          primaryAction: undefined,
          secondaryActions: undefined,
        }}
      />
    );

    expect(
      screen.queryByText("Acciones de bajo riesgo para seguir esta compra.")
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Volver a comprar" })).toBeNull();
  });
});
