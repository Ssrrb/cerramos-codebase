import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createSignedReadUrlMock,
  extractProductImageObjectKeyMock,
  fetchMock,
  logErrorMock,
  logWarnMock,
  objectExistsMock,
  parseErrorMock,
} =
  vi.hoisted(() => ({
    createSignedReadUrlMock: vi.fn(),
    extractProductImageObjectKeyMock: vi.fn(),
    fetchMock: vi.fn(),
    logErrorMock: vi.fn(),
    logWarnMock: vi.fn(),
    objectExistsMock: vi.fn(),
    parseErrorMock: vi.fn(),
  }));

vi.mock("@repo/storage", () => ({
  createSignedReadUrl: createSignedReadUrlMock,
  objectExists: objectExistsMock,
}));

vi.mock("@repo/storage/product-image", () => ({
  extractProductImageObjectKey: extractProductImageObjectKeyMock,
}));

vi.mock("@repo/observability/error", () => ({
  parseError: parseErrorMock,
}));

vi.mock("@repo/observability/log", () => ({
  log: {
    error: logErrorMock,
    warn: logWarnMock,
  },
}));

vi.stubGlobal("fetch", fetchMock);

describe("public product image route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    createSignedReadUrlMock.mockReset();
    extractProductImageObjectKeyMock.mockReset();
    fetchMock.mockReset();
    logErrorMock.mockReset();
    logWarnMock.mockReset();
    objectExistsMock.mockReset();
    parseErrorMock.mockReset();
    parseErrorMock.mockImplementation((error: unknown) =>
      error instanceof Error ? error.message : String(error)
    );
  });

  test("proxies a public product image through the app origin", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    objectExistsMock.mockResolvedValue(true);
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
    expect(objectExistsMock).toHaveBeenCalledWith({
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
    expect(objectExistsMock).not.toHaveBeenCalled();
    expect(logWarnMock).toHaveBeenCalledWith(
      "Public product image request rejected",
      expect.objectContaining({
        failureStage: "invalid_key",
        routeName: "product-link-images",
      })
    );
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
    expect(objectExistsMock).not.toHaveBeenCalled();
  });

  test("returns 404 when the object does not exist", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    objectExistsMock.mockResolvedValue(false);

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
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(logWarnMock).toHaveBeenCalledWith(
      "Public product image object was not found",
      expect.objectContaining({
        failureStage: "not_found",
        objectKey: "products/commerce_1/images/object.png",
      })
    );
  });

  test("returns the upstream error when the signed read target fails", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    objectExistsMock.mockResolvedValue(true);
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
    expect(logErrorMock).toHaveBeenCalledWith(
      "Storage responded with a non-OK status for product image",
      expect.objectContaining({
        failureStage: "upstream_fetch_failed",
        upstreamStatus: 404,
      })
    );
  });

  test("returns 500 when signing the read URL fails", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    objectExistsMock.mockResolvedValue(true);
    createSignedReadUrlMock.mockRejectedValue(new Error("signing failed"));

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fobject.png"
      )
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo cargar la imagen del producto.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(logErrorMock).toHaveBeenCalledWith(
      "Failed to sign public product image read URL",
      expect.objectContaining({
        errorMessage: "signing failed",
        failureStage: "sign_failed",
      })
    );
  });

  test("returns 500 when the upstream fetch throws", async () => {
    extractProductImageObjectKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    objectExistsMock.mockResolvedValue(true);
    createSignedReadUrlMock.mockResolvedValue({
      bucketName: "imagenes-cerramos",
      expiresAt: "2026-04-09T12:00:00.000Z",
      objectKey: "products/commerce_1/images/object.png",
      url: "https://storage.googleapis.com/signed-object",
    });
    fetchMock.mockRejectedValue(new Error("network failed"));

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/product-link-images?objectKey=products%2Fcommerce_1%2Fimages%2Fobject.png"
      )
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo cargar la imagen del producto.",
    });
    expect(logErrorMock).toHaveBeenCalledWith(
      "Failed to fetch public product image from storage",
      expect.objectContaining({
        errorMessage: "network failed",
        failureStage: "upstream_fetch_failed",
      })
    );
  });
});
