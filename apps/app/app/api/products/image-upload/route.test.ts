import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSessionMock, createSignedUploadUrlMock, buildProductImageKeyMock } =
  vi.hoisted(() => ({
    buildProductImageKeyMock: vi.fn(),
    createSignedUploadUrlMock: vi.fn(),
    getSessionMock: vi.fn(),
  }));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
}));

vi.mock("@repo/storage", () => ({
  createSignedUploadUrl: createSignedUploadUrlMock,
}));

vi.mock("@repo/storage/product", () => ({
  buildProductImageKey: buildProductImageKeyMock,
}));

describe("product image upload route", () => {
  beforeEach(() => {
    vi.resetModules();
    getSessionMock.mockReset();
    createSignedUploadUrlMock.mockReset();
    buildProductImageKeyMock.mockReset();
  });

  test("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products/image-upload", {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  test("rejects invalid upload payloads", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        id: "user_1",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products/image-upload", {
        body: JSON.stringify({
          contentType: "image/png",
          fileName: "",
          size: 10,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);

    const payload = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string[] | undefined>;
    };

    expect(payload.error).toBe("Invalid upload payload.");
    expect(payload.fieldErrors.fileName).toBeTruthy();
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  test("rejects unsupported content types", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        id: "user_1",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products/image-upload", {
        body: JSON.stringify({
          contentType: "application/pdf",
          fileName: "catalogo.pdf",
          size: 1024,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Solo puedes subir archivos de imagen compatibles.",
    });
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  test("returns a signed upload target for authenticated merchants", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        id: "user_1",
      },
    });
    buildProductImageKeyMock.mockReturnValue(
      "products/commerce_1/images/object.png"
    );
    createSignedUploadUrlMock.mockResolvedValue({
      bucketName: "cerramos-assets",
      contentType: "image/png",
      expiresAt: "2026-03-29T12:00:00.000Z",
      headers: {
        "content-type": "image/png",
      },
      maxBytes: 1024,
      method: "PUT",
      objectKey: "products/commerce_1/images/object.png",
      url: "https://upload.example.test",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/products/image-upload", {
        body: JSON.stringify({
          contentType: "image/png",
          fileName: "licuadora.png",
          size: 1024,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(buildProductImageKeyMock).toHaveBeenCalledWith({
      commerceId: "commerce_1",
      fileName: "licuadora.png",
    });
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith({
      contentType: "image/png",
      maxBytes: 1024,
      objectKey: "products/commerce_1/images/object.png",
    });
    await expect(response.json()).resolves.toEqual({
      bucketName: "cerramos-assets",
      contentType: "image/png",
      expiresAt: "2026-03-29T12:00:00.000Z",
      headers: {
        "content-type": "image/png",
      },
      maxBytes: 1024,
      method: "PUT",
      objectKey: "products/commerce_1/images/object.png",
      url: "https://upload.example.test",
    });
  });
});
