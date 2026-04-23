import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { fetchMock, refreshMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    disconnect() {
      // test stub
    }
    observe() {
      // test stub
    }
    unobserve() {
      // test stub
    }
  }
);
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
}
if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {};
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

import { ProductLinkForm } from "./product-link-form";

const product = {
  category: "Electrodomesticos",
  commerceSlug: "cerramos",
  deliveryIncluded: true,
  description: "Descripcion del producto base",
  id: "product_1",
  image: "https://cdn.example.test/licuadora.png",
  imageObjectKey: "products/commerce_1/images/licuadora.png",
  kind: "product" as const,
  name: "Licuadora Cerramos",
  productLink: null,
  status: "active" as const,
  stock: 14,
  unitPrice: 185_000,
};

describe("product link form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    refreshMock.mockReset();
    fetchMock.mockResolvedValue({
      json: async () => ({
        id: "product_link_1",
        success: true,
      }),
      ok: true,
    });
  });

  test("uses a staged flow and removes editable price input", () => {
    render(<ProductLinkForm product={product} />);

    expect(screen.queryByLabelText("Precio")).toBeNull();
    expect(screen.getByText(/Precio base del producto:/i)).toBeDefined();
    expect(screen.queryByLabelText("Expira el")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Continuar con checkout" })
    ).toBeDefined();
  });

  test("shows subscription cadence only for subscription billing", () => {
    render(<ProductLinkForm product={product} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar con checkout" })
    );

    expect(screen.queryByLabelText("Cadencia de suscripción")).toBeNull();
    cleanup();

    render(
      <ProductLinkForm
        product={product}
        productLink={{
          billingMode: "subscription",
          currency: "PYG",
          description: "Descripcion del producto base",
          expiresAt: null,
          fulfillmentMode: "delivery_or_pickup",
          id: "product_link_1",
          imageUrl: null,
          paymentRequired: true,
          publicPath: "/buy/cerramos/licuadora-cerramos",
          slug: "licuadora-cerramos",
          status: "draft",
          subscriptionCadence: "monthly",
          title: "Licuadora Cerramos",
          unitPrice: 185_000,
        }}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar con checkout" })
    );

    expect(screen.getByRole("combobox", { name: "Cadencia de suscripción" })).toBeDefined();
  });

  test("keeps expiry only in the publish step and submits the preserved base price", async () => {
    const onSuccess = vi.fn();

    render(<ProductLinkForm onSuccess={onSuccess} product={product} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar con checkout" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar publicación" })
    );

    expect(screen.getByLabelText("Expira el")).toBeDefined();
    expect(screen.getByText("Revisión rápida")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Publicar link" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(requestUrl).toBe("/api/product-links");
    expect(requestInit.headers).toEqual({
      "content-type": "application/json",
    });
    expect(requestInit.method).toBe("POST");
    expect(JSON.parse(String(requestInit.body))).toEqual({
      billingMode: "one_time",
      description: "Descripcion del producto base",
      expiresAt: "",
      fulfillmentMode: "delivery_or_pickup",
      paymentRequired: false,
      productId: "product_1",
      slug: "licuadora-cerramos",
      status: "draft",
      subscriptionCadence: "monthly",
      title: "Licuadora Cerramos",
      unitPrice: 185_000,
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
});
