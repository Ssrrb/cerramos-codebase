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
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:preview-image"),
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    /* biome-ignore lint/performance/noImgElement: test double for next/image */
    <img alt={alt} height={1} src={src} width={1} />
  ),
}));

import { AddProductForm } from "./add-product-form";

const goToDetailsStep = () => {
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.click(screen.getByRole("button", { name: "Completar datos" }));
};

describe("add product form", () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  const originalNextPublicBucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockReset();
    process.env.NEXT_PUBLIC_GCS_BUCKET_NAME = originalNextPublicBucketName;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    refreshMock.mockReset();
    process.env.NEXT_PUBLIC_GCS_BUCKET_NAME = "imagenes-cerramos";
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
    goToDetailsStep();

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
      target: { value: "185000", valueAsNumber: 185_000 },
    });

    const file = new File(["image"], "licuadora.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/products/image-upload",
        {
          body: JSON.stringify({
            contentType: "image/png",
            fileName: "licuadora.png",
            size: 5,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        }
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://upload.example.test",
      {
        body: file,
        headers: {
          "content-type": "image/png",
        },
        method: "PUT",
      }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/products", {
      body: JSON.stringify({
        category: "Electrodomesticos",
        deliveryIncluded: false,
        description: "Licuadora premium para tu cocina diaria.",
        imageObjectKey: "products/commerce_1/images/licuadora.png",
        kind: "product",
        name: "Licuadora Cerramos",
        status: "draft",
        stock: 14,
        unitPrice: 185_000,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  test("hides stock for services and submits stock as zero", async () => {
    const onSuccess = vi.fn();

    render(<AddProductForm onSuccess={onSuccess} />);

    fireEvent.click(screen.getByText("Servicio"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByText("Sí, coordino entrega"));
    fireEvent.click(screen.getByRole("button", { name: "Completar datos" }));

    expect(screen.queryByLabelText("Stock")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Ej. Licuadora Oster 700W"), {
      target: { value: "Consultoria Cerramos" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Describe que hace especial a este producto."
      ),
      {
        target: { value: "Servicio premium para equipos comerciales." },
      }
    );
    fireEvent.change(screen.getByLabelText("Precio"), {
      target: { value: "320000", valueAsNumber: 320_000 },
    });

    const file = new File(["image"], "servicio.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Imagen principal"), {
      target: { files: [file] },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/products", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Servicio premium para equipos comerciales.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          kind: "service",
          name: "Consultoria Cerramos",
          status: "draft",
          stock: 0,
          unitPrice: 320_000,
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

  test("shows stock again when switching back from service to product", () => {
    render(<AddProductForm />);

    fireEvent.click(screen.getByText("Servicio"));
    fireEvent.click(screen.getByText("Producto"));
    goToDetailsStep();

    expect(screen.getByLabelText("Stock")).toBeDefined();
  });

  test("submits product edits without forcing an image re-upload", async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        id: "product_1",
        success: true,
      }),
      ok: true,
    });

    const onSuccess = vi.fn();

    render(
      <AddProductForm
        mode="edit"
        onSuccess={onSuccess}
        product={{
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Descripcion original",
          id: "product_1",
          image: "https://cdn.example.test/licuadora.png",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }}
      />
    );
    goToDetailsStep();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Describe que hace especial a este producto."
      ),
      {
        target: { value: "Licuadora premium actualizada para cocina diaria." },
      }
    );

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/products/product_1", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Licuadora premium actualizada para cocina diaria.",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          kind: "product",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  test("preserves legacy stored product image refs during edit submissions", async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        id: "product_legacy",
        success: true,
      }),
      ok: true,
    });

    const onSuccess = vi.fn();

    render(
      <AddProductForm
        mode="edit"
        onSuccess={onSuccess}
        product={{
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Descripcion original",
          id: "product_legacy",
          image: "https://cdn.example.test/licuadora.png",
          imageObjectKey:
            "gs://imagenes-cerramos/products/commerce_1/images/licuadora.png",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/products/product_legacy", {
        body: JSON.stringify({
          category: "Electrodomesticos",
          deliveryIncluded: true,
          description: "Descripcion original",
          imageObjectKey: "products/commerce_1/images/licuadora.png",
          kind: "product",
          name: "Licuadora Cerramos",
          status: "active",
          stock: 14,
          unitPrice: 185_000,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(screen.queryByText("La imagen del producto es obligatoria.")).toBe(
      null
    );
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
    goToDetailsStep();

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
      target: { value: "185000", valueAsNumber: 185_000 },
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
    goToDetailsStep();

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
    goToDetailsStep();

    fireEvent.change(
      screen.getAllByPlaceholderText("0")[0] as HTMLInputElement,
      {
        target: { value: "", valueAsNumber: Number.NaN },
      }
    );

    expect(
      (screen.getAllByPlaceholderText("0")[0] as HTMLInputElement).value
    ).toBe("0");
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Received NaN for the `value` attribute")
    );
  });

  test("does not submit blob preview values as image object keys", async () => {
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce({
        json: async () => ({
          headers: {
            "content-type": "image/png",
          },
          method: "PUT",
          objectKey: "blob:preview-image",
          url: "https://upload.example.test",
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
    });

    render(<AddProductForm />);
    goToDetailsStep();

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
      target: { value: "185000", valueAsNumber: 185_000 },
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenNthCalledWith(
      3,
      "/api/products",
      expect.anything()
    );
  });
});
