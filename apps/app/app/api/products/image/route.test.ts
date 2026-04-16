import { NextResponse } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  requireCommerceContextForRequestMock,
  createSignedReadUrlMock,
  fetchMock,
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

describe("product image proxy route", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    requireCommerceContextForRequestMock.mockReset();
    createSignedReadUrlMock.mockReset();
    fetchMock.mockReset();
  });

  test("proxies an authorized product image through the app origin", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
      },
    });
    createSignedReadUrlMock.mockResolvedValue({
      url: "https://storage.googleapis.com/signed-image",
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
        "http://localhost/api/products/image?objectKey=imagenes-cerramos/products/commerce_1/images/object.png"
      )
    );

    expect(createSignedReadUrlMock).toHaveBeenCalledWith({
      objectKey: "products/commerce_1/images/object.png",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.googleapis.com/signed-image",
      {
        cache: "no-store",
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("private, max-age=60");
    expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe(
      "same-origin"
    );
    await expect(response.text()).resolves.toBe("image-bytes");
  });

  test("rejects missing object keys", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/products/image")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Product image object key is required.",
    });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });

  test("rejects image keys outside the merchant namespace", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue({
      commerce: {
        id: "commerce_1",
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/products/image?objectKey=products/commerce_2/images/object.png"
      )
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Forbidden",
    });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });

  test("returns auth responses from the shared request helper", async () => {
    requireCommerceContextForRequestMock.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/products/image?objectKey=products/commerce_1/images/object.png"
      )
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
    expect(createSignedReadUrlMock).not.toHaveBeenCalled();
  });
});
