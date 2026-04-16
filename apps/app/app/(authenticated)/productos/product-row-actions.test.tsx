import {
  act,
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("@/app/components/product-sheet-content", () => ({
  ProductSheetContent: () => <div>edit sheet</div>,
}));

import { ProductRowActions } from "./product-row-actions";

const OPEN_MENU_PATTERN = /open menu/i;
const DELETE_ERROR_MESSAGE = "No se pudo eliminar el producto.";
const DELETE_DESCRIPTION_PATTERN = /vas a eliminar/i;
const product = {
  category: "Electrodomesticos",
  deliveryIncluded: false,
  description: "Descripcion",
  id: "product_1",
  image: "https://cdn.example.test/product.png",
  imageObjectKey: "products/commerce_1/images/product.png",
  name: "Licuadora Cerramos",
  status: "active" as const,
  stock: 12,
  unitPrice: 185_000,
};

const requestDeleteDialog = () => {
  fireEvent.pointerDown(
    screen.getByRole("button", { name: OPEN_MENU_PATTERN })
  );
  fireEvent.click(screen.getByText("Eliminar producto"));
};

const openDeleteDialog = async () => {
  requestDeleteDialog();

  await waitFor(() =>
    expect(screen.getByText(DELETE_DESCRIPTION_PATTERN)).toBeDefined()
  );
};

describe("product row actions", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    refreshMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("opens the delete dialog after the dropdown closes", async () => {
    vi.useFakeTimers();

    render(<ProductRowActions product={product} />);

    requestDeleteDialog();

    expect(screen.queryByText(DELETE_DESCRIPTION_PATTERN)).toBeNull();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText(DELETE_DESCRIPTION_PATTERN)).toBeDefined();
  });

  test("deletes a product from the confirmation dialog", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        id: "product_1",
        success: true,
      }),
      ok: true,
    });

    render(<ProductRowActions product={product} />);

    await openDeleteDialog();

    expect(screen.getByText("Eliminar producto")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/products/product_1", {
        method: "DELETE",
      })
    );
    expect(refreshMock).toHaveBeenCalled();
  });

  test("shows the API error and does not refresh when delete fails", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        error: "No puedes eliminar este producto todavia.",
      }),
      ok: false,
    });

    render(<ProductRowActions product={product} />);

    await openDeleteDialog();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() =>
      expect(
        screen.getByText("No puedes eliminar este producto todavia.")
      ).toBeDefined()
    );
    expect(refreshMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Eliminar" }).hasAttribute("disabled")
    ).toBe(false);
  });

  test("shows the fallback error and clears loading state when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network error"));

    render(<ProductRowActions product={product} />);

    await openDeleteDialog();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() =>
      expect(screen.getByText(DELETE_ERROR_MESSAGE)).toBeDefined()
    );
    expect(refreshMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Eliminar" }).hasAttribute("disabled")
    ).toBe(false);
  });

  test("shows an error and does not refresh when a successful response is not valid json payload", async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => null,
      ok: true,
    });

    render(<ProductRowActions product={product} />);

    await openDeleteDialog();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() =>
      expect(screen.getByText(DELETE_ERROR_MESSAGE)).toBeDefined()
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
