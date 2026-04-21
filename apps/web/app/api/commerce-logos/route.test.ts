import { beforeEach, describe, expect, test, vi } from "vitest";

const { createSignedReadUrlMock, extractCommerceLogoObjectKeyMock, fetchMock } =
  vi.hoisted(() => ({
    createSignedReadUrlMock: vi.fn(),
    extractCommerceLogoObjectKeyMock: vi.fn(),
    fetchMock: vi.fn(),
  }));

vi.mock("@repo/storage", () => ({
  createSignedReadUrl: createSignedReadUrlMock,
}));

vi.mock("@repo/storage/commerce-logo", () => ({
  extractCommerceLogoObjectKey: extractCommerceLogoObjectKeyMock,
}));

vi.stubGlobal("fetch", fetchMock);

describe("public commerce logo route", () => {
  beforeEach(() => {
    vi.resetModules();
    createSignedReadUrlMock.mockReset();
    extractCommerceLogoObjectKeyMock.mockReset();
    fetchMock.mockReset();
  });

  test("proxies a public commerce logo through the app origin", async () => {
    extractCommerceLogoObjectKeyMock.mockReturnValue(
      "commerces/user_1/logos/logo.png"
    );
    createSignedReadUrlMock.mockResolvedValue({
      bucketName: "imagenes-cerramos",
      expiresAt: "2026-04-09T12:00:00.000Z",
      objectKey: "commerces/user_1/logos/logo.png",
      url: "https://storage.googleapis.com/signed-logo",
    });
    fetchMock.mockResolvedValue(
      new Response("image-bytes", {
        headers: {
          "cache-control": "private, max-age=60",
          "content-type": "image/png",
        },
        status: 200,
      })
    );

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/commerce-logos?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png"
      )
    );

    expect(createSignedReadUrlMock).toHaveBeenCalledWith({
      objectKey: "commerces/user_1/logos/logo.png",
    });
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("image-bytes");
  });

  test("returns 400 when object key is missing", async () => {
    extractCommerceLogoObjectKeyMock.mockReturnValue("");

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/commerce-logos")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce logo object key is required.",
    });
  });
});
