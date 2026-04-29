import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getCustomerOrdenesPageDataMock, requireSessionMock } = vi.hoisted(
  () => ({
    getCustomerOrdenesPageDataMock: vi.fn(),
    requireSessionMock: vi.fn(),
  })
);

vi.mock("@repo/auth/server", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/customer-ordenes", () => ({
  getCustomerOrdenesPageData: getCustomerOrdenesPageDataMock,
}));

const populatedPageData = {
  breadcrumbItems: [
    { href: "/es", label: "Inicio" },
    { label: "Cuenta" },
    { label: "Órdenes" },
  ],
  items: [
    {
      amountLabel: "Gs. 145.000",
      id: "order_1",
      kind: "order" as const,
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
      secondaryActions: [],
      status: {
        detail: "El comercio confirmó el pedido.",
        label: "En preparación",
        tone: "info" as const,
      },
      timeline: [
        { label: "Compra", value: "28 abr 2026" },
        { label: "Última novedad", value: "29 abr, 14:10" },
        { label: "Vencimiento", value: "30 abr 2026" },
      ],
      title: "Set matero de acero",
    },
    {
      amountLabel: "Gs. 89.000",
      id: "sub_1",
      kind: "subscription" as const,
      merchantLabel: "Plan Growth",
      occurredAt: "2026-04-20T12:00:00.000Z",
      primaryAction: {
        href: "/es/buy/plan-growth/growth-mensual",
        label: "Abrir plan",
      },
      reference: "SUB-0301",
      secondaryActions: [],
      status: {
        detail: "Tu próxima renovación se procesará automáticamente.",
        label: "Activa",
        tone: "success" as const,
      },
      subscriptionDetails: {
        cadenceLabel: "Mensual",
        managementEligible: true,
        nextChargeLabel: "20 may 2026",
        renewalStatus: "Renovación automática activa.",
      },
      timeline: [
        { label: "Alta", value: "20 abr 2026" },
        { label: "Última novedad", value: "20 abr, 12:00" },
        { label: "Próximo cobro", value: "20 may 2026" },
      ],
      title: "Plan Growth mensual",
    },
  ],
  recommendations: [],
  summary: [
    { label: "Total", value: "2" },
    { label: "Activas", value: "2" },
    { label: "Atención", value: "0" },
  ],
  title: "Tus órdenes",
};

describe("customer ordenes page route", () => {
  beforeEach(() => {
    vi.resetModules();
    getCustomerOrdenesPageDataMock.mockReset();
    requireSessionMock.mockReset();
    requireSessionMock.mockResolvedValue({
      user: {
        id: "user_1",
      },
    });
  });

  test("renders the signed-in customer account tracking UI", async () => {
    getCustomerOrdenesPageDataMock.mockResolvedValue(populatedPageData);

    const { default: CustomerOrdenesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerOrdenesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(getCustomerOrdenesPageDataMock).toHaveBeenCalledWith({
      locale: "es",
      userId: "user_1",
    });
    expect(html).toContain("Tus órdenes");
    expect(html).toContain("Set matero de acero");
    expect(html).toContain("Plan Growth mensual");
    expect(html).toContain("Mate Shop");
  });

  test("bubbles the auth gate when the customer is signed out", async () => {
    requireSessionMock.mockRejectedValue(new Error("redirect"));

    const { default: CustomerOrdenesRoute } = await import("./page");

    await expect(
      CustomerOrdenesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    ).rejects.toThrow("redirect");
  });

  test("renders the empty state when the account has no history", async () => {
    getCustomerOrdenesPageDataMock.mockResolvedValue({
      ...populatedPageData,
      items: [],
      summary: [
        { label: "Total", value: "0" },
        { label: "Activas", value: "0" },
        { label: "Atención", value: "0" },
      ],
    });

    const { default: CustomerOrdenesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerOrdenesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(html).toContain("Todavía no tenés actividad");
  });

  test("renders the error state when data loading fails", async () => {
    getCustomerOrdenesPageDataMock.mockRejectedValue(new Error("db failure"));

    const { default: CustomerOrdenesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerOrdenesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(html).toContain("Hubo un problema al recuperar tu cuenta");
    expect(html).toContain("Volver a intentar");
  });

  test("renders the loading shell for suspense transitions", async () => {
    const { default: LoadingCustomerOrdenesPage } = await import("./loading");
    const html = renderToStaticMarkup(<LoadingCustomerOrdenesPage />);

    expect(html).toContain('data-slot="skeleton"');
  });
});
