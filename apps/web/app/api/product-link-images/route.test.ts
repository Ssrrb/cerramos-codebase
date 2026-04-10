import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createSignedReadUrlMock,
  extractProductImageObjectKeyMock,
  fetchMock,
} =
  vi.hoisted(() => ({
    createSignedReadUrlMock: vi.fn(),
    extractProductImageObjectKeyMock: vi.fn(),
    fetchMock: vi.fn(),
  }));

vi.mock("@repo/storage", () => ({
  createSignedReadUrl: createSignedReadUrlMock,
}));

vi.mock("@repo/storage/product-image", () => ({
  extractProductImageObjectKey: extractProductImageObjectKeyMock,
}));

vi.stubGlobal("fetch", fetchMock);

describe("public product image route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    createSignedReadUrlMock.mockReset();
    extractProductImageObjectKeyMock.mockReset();
    fetchMock.mockReset();
  });

  test("proxies a public product image through the app origin", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    createSignedReadUrlMock.mockResolvedValue({
      bucketName: "imagenes-cerramos",
      expiresAt: "2026-04-09T12:00:00.000Z",
      objectKey: "products/commerce_1/images/object.png",
      url: "https://storage.googleapis.com/signed-object",
    });
    fetchMock.mockResolvedValue(
      new Response("image-bytes", {
        headers: {
          "cache-control": "private, max-age=60",
          "content-type": "image/jpeg",
        },
        status: 200,
      })
    );

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fobject.png"
      )
    );

    expect(createSignedReadUrlMock).toHaveBeenCalledWith({
      objectKey: "products/commerce_1/images/object.png",
    });
    expect(extractProductImageObjectKeyMock).toHaveBeenCalledWith(
      "products/commerce_1/images/object.png",
      process.env.GCS_BUCKET_NAME
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.googleapis.com/signed-object",
      {
        cache: "no-store",
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toBe("private, max-age=60");
    expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe(
      "same-origin"
    );
    await expect(response.text()).resolves.toBe("image-bytes");
  });

  test("returns 400 when object key is missing", async () => {
    extractProductImageObjectKeyMock.mockReturnValue("");
    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/product-link-images")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Product image object key is required.",
    });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });

  test("returns 400 when the incoming object key is invalid", async () => {
    extractProductImageObjectKeyMock.mockReturnValue("");
    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/product-link-images?objectKey=https%3A%2F%2Fexample.com%2Fbad.png"
      )
    );

    expect(extractProductImageObjectKeyMock).toHaveBeenCalledWith(
      "https://example.com/bad.png",
      process.env.GCS_BUCKET_NAME
    );
    expect(response.status).toBe(400);
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });

  test("returns the upstream error when the signed read target fails", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    createSignedReadUrlMock.mockResolvedValue({
      bucketName: "imagenes-cerramos",
      expiresAt: "2026-04-09T12:00:00.000Z",
      objectKey: "products/commerce_1/images/object.png",
      url: "https://storage.googleapis.com/signed-object",
    });
    fetchMock.mockResolvedValue(
      new Response("missing", {
        status: 404,
      })
    );

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fobject.png"
      )
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo cargar la imagen del producto.",
    });
  });
});
