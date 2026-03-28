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
    disconnect() {}
    observe() {}
    unobserve() {}
  }
);
vi.stubGlobal("FileReader", class MockFileReader {
  onload: null | (() => void) = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,preview`;
    this.onload?.();
  }
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
  }: {
    alt: string;
    src: string;
  }) => <img alt={alt} src={src} />,
}));

import { AddProductForm } from "./add-product-form";

describe("add product form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    refreshMock.mockReset();
    fetchMock.mockResolvedValue({
      json: async () => ({
        id: "product_1",
        success: true,
      }),
      ok: true,
    });
  });

  test("submits the v1 payload and refreshes the page", async () => {
    const onSuccess = vi.fn();

    render(<AddProductForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Ej. Licuadora Oster 700W"), {
      target: { value: "Licuadora Cerramos" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Describe que hace especial a este producto."
      ),
      {
        target: { value: "Licuadora premium para tu cocina diaria." },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "14", valueAsNumber: 14 },
    });

    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: false,
          description: "Licuadora premium para tu cocina diaria.",
          imageUrl: "data:image/png;base64,preview",
          name: "Licuadora Cerramos",
          status: "draft",
          stock: 14,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  test("maps image route errors back to the form", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        error: "Invalid product data.",
        fieldErrors: {
          imageUrl: ["La imagen del producto es obligatoria."],
        },
      }),
      ok: false,
    });

    render(<AddProductForm />);

    fireEvent.change(screen.getByPlaceholderText("Ej. Licuadora Oster 700W"), {
      target: { value: "Licuadora Cerramos" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Describe que hace especial a este producto."
      ),
      {
        target: { value: "Licuadora premium para tu cocina diaria." },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "14", valueAsNumber: 14 },
    });
    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(
        screen.getByText("La imagen del producto es obligatoria.")
      ).toBeDefined()
    );
  });
});
