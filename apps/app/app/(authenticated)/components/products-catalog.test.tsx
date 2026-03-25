import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ProductsCatalog } from "./products-catalog";
import type {
  CatalogMetric,
  CreateProductLinkActionState,
  ProductCatalogItem,
} from "./products-catalog.types";

const metrics: CatalogMetric[] = [
  { id: "total", label: "Total productos", note: "note", value: "2" },
  { id: "active", label: "Activos", note: "note", value: "1" },
  { id: "payment", label: "Cobro requerido", note: "note", value: "1" },
  { id: "attention", label: "Atención", note: "note", value: "0" },
];

const products: ProductCatalogItem[] = [
  {
    currency: "PYG",
    description: "Remera pensada para cerrar desde chat.",
    expiresAt: null,
    expiresLabel: "Sin vencimiento",
    formattedPrice: "Gs. 129.000",
    fulfillmentLabel: "Retiro y entrega",
    fulfillmentMode: "both",
    id: "1",
    imageUrl: null,
    inventoryLabel: "Inventario no conectado",
    paymentLabel: "Cobro previo habilitado",
    paymentRequired: true,
    priceValue: 129_000,
    slug: "remera-premium",
    status: "active",
    statusLabel: "Activo",
    title: "Remera premium",
    updatedLabel: "Actualizado 25 mar 2026",
    variantSummary: "2 variantes",
    variantValues: ["M", "L"],
  },
  {
    currency: "PYG",
    description: "Termo listo para retiro.",
    expiresAt: null,
    expiresLabel: "Sin vencimiento",
    formattedPrice: "Gs. 89.000",
    fulfillmentLabel: "Solo retiro",
    fulfillmentMode: "pickup",
    id: "2",
    imageUrl: null,
    inventoryLabel: "Inventario no conectado",
    paymentLabel: "Cobro al confirmar",
    paymentRequired: false,
    priceValue: 89_000,
    slug: "termo-mate",
    status: "draft",
    statusLabel: "Borrador",
    title: "Termo mate",
    updatedLabel: "Actualizado 24 mar 2026",
    variantSummary: "Sin variantes",
    variantValues: [],
  },
];

const noopAction = async (
  state: CreateProductLinkActionState
): Promise<CreateProductLinkActionState> => state;

const emptyStateCopyPattern = /Crea tu primer link vendible/i;

class ResizeObserverMock {
  disconnect() {
    // No-op for tests.
  }

  observe() {
    // No-op for tests.
  }

  unobserve() {
    // No-op for tests.
  }
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
globalThis.matchMedia =
  globalThis.matchMedia ||
  vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));

const renderCatalog = (catalogProducts: ProductCatalogItem[] = products) =>
  render(
    <SidebarProvider>
      <ProductsCatalog
        createProductLinkAction={noopAction}
        metrics={metrics}
        products={catalogProducts}
      />
    </SidebarProvider>
  );

describe("ProductsCatalog", () => {
  test("filters the catalog by search term", () => {
    renderCatalog();

    fireEvent.change(screen.getByLabelText("Buscar productos"), {
      target: { value: "termo" },
    });

    expect(screen.queryAllByText("Remera premium")).toHaveLength(0);
    expect(screen.getAllByText("Termo mate").length).toBeGreaterThan(0);
  });

  test("opens the add product sheet", () => {
    renderCatalog();

    fireEvent.click(screen.getAllByText("Crear producto")[0]);

    expect(screen.getByText("Nuevo producto")).toBeDefined();
  });

  test("renders the empty state when the catalog has no products", () => {
    renderCatalog([]);

    expect(screen.getByText(emptyStateCopyPattern)).toBeDefined();
  });
});
