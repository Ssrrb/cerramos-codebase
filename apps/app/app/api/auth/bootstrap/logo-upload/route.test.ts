import { beforeEach, describe, expect, test, vi } from "vitest";

const { buildCommerceLogoKeyMock, createSignedUploadUrlMock, getSessionMock } =
  vi.hoisted(() => ({
    buildCommerceLogoKeyMock: vi.fn(),
    createSignedUploadUrlMock: vi.fn(),
    getSessionMock: vi.fn(),
  }));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
}));

vi.mock("@repo/storage", () => ({
  createSignedUploadUrl: createSignedUploadUrlMock,
}));

vi.mock("@repo/storage/commerce", () => ({
  buildCommerceLogoKey: buildCommerceLogoKeyMock,
}));

describe("bootstrap logo upload route", () => {
  beforeEach(() => {
    vi.resetModules();
    buildCommerceLogoKeyMock.mockReset();
    createSignedUploadUrlMock.mockReset();
    getSessionMock.mockReset();
  });

  test("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap/logo-upload", {
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
        id: "user_1",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap/logo-upload", {
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
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  test("returns a signed upload target for an authenticated user", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "user_1",
      },
    });
    buildCommerceLogoKeyMock.mockReturnValue("commerces/user_1/logos/logo.png");
    createSignedUploadUrlMock.mockResolvedValue({
      bucketName: "cerramos-assets",
      contentType: "image/png",
      expiresAt: "2026-04-09T12:00:00.000Z",
      headers: {
        "content-type": "image/png",
      },
      maxBytes: 1024,
      method: "PUT",
      objectKey: "commerces/user_1/logos/logo.png",
      url: "https://upload.example.test",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap/logo-upload", {
        body: JSON.stringify({
          contentType: "image/png",
          fileName: "logo.png",
          size: 1024,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(buildCommerceLogoKeyMock).toHaveBeenCalledWith({
      fileName: "logo.png",
      ownerId: "user_1",
    });
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith({
      contentType: "image/png",
      maxBytes: 1024,
      objectKey: "commerces/user_1/logos/logo.png",
    });
    await expect(response.json()).resolves.toEqual({
      bucketName: "cerramos-assets",
      contentType: "image/png",
      expiresAt: "2026-04-09T12:00:00.000Z",
      headers: {
        "content-type": "image/png",
      },
      maxBytes: 1024,
      method: "PUT",
      objectKey: "commerces/user_1/logos/logo.png",
      url: "https://upload.example.test",
    });
  });
});
