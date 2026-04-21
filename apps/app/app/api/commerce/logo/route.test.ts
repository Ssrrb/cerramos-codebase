import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  createSignedReadUrlMock,
  fetchMock,
  requireCommerceContextForRequestMock,
} = vi.hoisted(() => ({
  createSignedReadUrlMock: vi.fn(),
  fetchMock: vi.fn(),
  requireCommerceContextForRequestMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContextForRequest: requireCommerceContextForRequestMock,
}));

vi.mock("@repo/storage", () => ({
  createSignedReadUrl: createSignedReadUrlMock,
}));

vi.stubGlobal("fetch", fetchMock);

describe("app commerce logo route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    createSignedReadUrlMock.mockReset();
    fetchMock.mockReset();
    requireCommerceContextForRequestMock.mockReset();
    requireCommerceContextForRequestMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
        logoImageUrl: "commerces/user_1/logos/logo.png",
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
      user: {
        email: "owner@example.com",
      },
    });
  });

  test("proxies the current commerce logo through the app origin", async () => {
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
        "http://localhost/api/commerce/logo?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png"
      )
    );

    expect(createSignedReadUrlMock).toHaveBeenCalledWith({
      objectKey: "commerces/user_1/logos/logo.png",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.googleapis.com/signed-logo",
      {
        cache: "no-store",
      }
    );
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("image-bytes");
  });

  test("returns 400 when object key is missing", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/commerce/logo")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Commerce logo object key is required.",
    });
  });

  test("returns 403 when the logo does not belong to the current commerce", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/commerce/logo?objectKey=commerces%2Fuser_2%2Flogos%2Fother.png"
      )
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });

  test("returns auth responses from the shared request helper", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/commerce/logo?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png"
      )
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });
});
