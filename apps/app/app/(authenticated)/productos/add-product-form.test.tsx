import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:preview-image"),
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
  const consoleErrorSpy = vi.spyOn(console, "error");

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockReset();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    refreshMock.mockReset();
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          headers: {
            "content-type": "image/png",
          },
          method: "PUT",
          objectKey: "products/commerce_1/images/licuadora.png",
          url: "https://upload.example.test",
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
      })
      .mockResolvedValueOnce({
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
    fireEvent.change(screen.getByLabelText("Stock"), {
      target: { value: "14", valueAsNumber: 14 },
    });
    fireEvent.change(screen.getByLabelText("Precio"), {
      target: { value: "185000", valueAsNumber: 185000 },
    });

    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/products/image-upload", {
        body: JSON.stringify({
          contentType: "image/png",
          fileName: "licuadora.png",
          size: 5,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://upload.example.test", {
      body: file,
      headers: {
        "content-type": "image/png",
      },
      method: "PUT",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/products", {
      body: JSON.stringify({
        category: "Electrodomesticos",
        deliveryIncluded: false,
        description: "Licuadora premium para tu cocina diaria.",
        imageObjectKey: "products/commerce_1/images/licuadora.png",
        name: "Licuadora Cerramos",
        status: "draft",
        stock: 14,
        unitPrice: 185000,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  test("maps image route errors back to the form", async () => {
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          headers: {
            "content-type": "image/png",
          },
          method: "PUT",
          objectKey: "products/commerce_1/images/licuadora.png",
          url: "https://upload.example.test",
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
      })
      .mockResolvedValueOnce({
        json: async () => ({
          error: "Invalid product data.",
          fieldErrors: {
            imageObjectKey: ["La imagen del producto es obligatoria."],
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
    fireEvent.change(screen.getByLabelText("Stock"), {
      target: { value: "14", valueAsNumber: 14 },
    });
    fireEvent.change(screen.getByLabelText("Precio"), {
      target: { value: "185000", valueAsNumber: 185000 },
    });
    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(
        screen.getByText("La imagen del producto es obligatoria.")
      ).toBeDefined()
    );
  });

  test("shows upload preparation errors before submitting the product", async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        error: "No se pudo preparar la carga de la imagen.",
      }),
      ok: false,
    });

    render(<AddProductForm />);

    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(
        screen.getByText("No se pudo preparar la carga de la imagen.")
      ).toBeDefined()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("does not pass NaN to the stock input when the field is cleared", () => {
    render(<AddProductForm />);

    fireEvent.change(screen.getAllByPlaceholderText("0")[0] as HTMLInputElement, {
      target: { value: "", valueAsNumber: Number.NaN },
    });

    expect((screen.getAllByPlaceholderText("0")[0] as HTMLInputElement).value).toBe("0");
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Received NaN for the `value` attribute")
    );
  });
});
