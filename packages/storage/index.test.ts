import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  existsSyncMock,
  getSignedUrlMock,
  deleteMock,
  existsMock,
  fileMock,
  bucketMock,
  storageMock,
  storageConstructorMock,
} = vi.hoisted(() => {
  const existsSyncMock = vi.fn<(path: string) => boolean>(() => false);
  const getSignedUrlMock = vi.fn();
  const deleteMock = vi.fn();
  const existsMock = vi.fn();
  const fileMock = vi.fn(() => ({
    delete: deleteMock,
    exists: existsMock,
    getSignedUrl: getSignedUrlMock,
  }));
  const bucketMock = vi.fn(() => ({
    file: fileMock,
  }));
  const storageMock = {
    bucket: bucketMock,
  };

  return {
    bucketMock,
    deleteMock,
    existsSyncMock,
    existsMock,
    fileMock,
    getSignedUrlMock,
    storageConstructorMock: vi.fn((options?: unknown) => ({
      options,
      storageMock,
    })),
    storageMock,
  };
});

vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(options: unknown) {
      storageConstructorMock(options);
      return storageMock;
    }
  },
}));

vi.mock("node:fs", () => ({
  existsSync: existsSyncMock,
}));

vi.mock("server-only", () => ({}));

describe("@repo/storage", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GCS_UPLOAD_URL_TTL_SECONDS;
    delete process.env.GCS_READ_URL_TTL_SECONDS;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    process.env.GCS_BUCKET_NAME = "cerramos-assets";
    storageConstructorMock.mockClear();
    bucketMock.mockClear();
    fileMock.mockClear();
    getSignedUrlMock.mockReset();
    deleteMock.mockReset();
    existsMock.mockReset();
    existsSyncMock.mockReset();
    existsSyncMock.mockReturnValue(false);
  });

  test("builds a deterministic object key shape", async () => {
    const randomUuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("uuid-123" as `${string}-${string}-${string}-${string}-${string}`);
    const { buildObjectKey } = await import("./index");

    expect(
      buildObjectKey({
        directory: "images",
        fileName: "Licuadora Ñandutí.png",
        prefix: "products/commerce_1",
      })
    ).toBe("products/commerce_1/images/uuid-123-licuadora-nanduti.png");

    randomUuidSpy.mockRestore();
  });

  test("creates a signed upload URL with the configured bucket", async () => {
    getSignedUrlMock.mockResolvedValue(["https://upload.example.test"]);
    const { createSignedUploadUrl } = await import("./index");

    const result = await createSignedUploadUrl({
      contentType: "image/png",
      maxBytes: 5 * 1024 * 1024,
      objectKey: "products/commerce_1/images/object.png",
    });

    expect(storageConstructorMock).toHaveBeenCalledWith({
      keyFilename: undefined,
      projectId: undefined,
    });
    expect(bucketMock).toHaveBeenCalledWith("cerramos-assets");
    expect(fileMock).toHaveBeenCalledWith("products/commerce_1/images/object.png");
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "write",
        contentType: "image/png",
        version: "v4",
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        bucketName: "cerramos-assets",
        contentType: "image/png",
        headers: {
          "content-type": "image/png",
        },
        maxBytes: 5 * 1024 * 1024,
        method: "PUT",
        objectKey: "products/commerce_1/images/object.png",
        url: "https://upload.example.test",
      })
    );
  });

  test("creates a signed read URL for a stored object", async () => {
    getSignedUrlMock.mockResolvedValue(["https://read.example.test"]);
    const { createSignedReadUrl } = await import("./index");

    const result = await createSignedReadUrl({
      objectKey: "products/commerce_1/images/object.png",
    });

    expect(getSignedUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "read",
        version: "v4",
      })
    );
    expect(result.url).toBe("https://read.example.test");
  });

  test("checks whether an object exists using the configured bucket", async () => {
    existsMock.mockResolvedValue([true]);
    const { objectExists } = await import("./index");

    await expect(
      objectExists({
        objectKey: "products/commerce_1/images/object.png",
      })
    ).resolves.toBe(true);

    expect(bucketMock).toHaveBeenCalledWith("cerramos-assets");
    expect(fileMock).toHaveBeenCalledWith("products/commerce_1/images/object.png");
    expect(existsMock).toHaveBeenCalledTimes(1);
  });

  test("uses the configured credential file when present", async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/cerramos-service-account.json";
    existsSyncMock.mockImplementation(
      (path: string) => path === "/tmp/cerramos-service-account.json"
    );
    getSignedUrlMock.mockResolvedValue(["https://upload.example.test"]);
    const { createSignedUploadUrl } = await import("./index");

    await createSignedUploadUrl({
      contentType: "image/png",
      objectKey: "products/commerce_1/images/object.png",
    });

    expect(storageConstructorMock).toHaveBeenCalledWith({
      keyFilename: "/tmp/cerramos-service-account.json",
      projectId: undefined,
    });
  });

  test("falls back to a matching credential file in the workspace when an absolute path is stale", async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
      "/Users/sebastian/Desktop/cerramos-codebase/cerramos-c686e70540fc.json";
    existsSyncMock.mockImplementation(
      (path: string) =>
        path === "/home/sebastian/Desktop/cerramos-codebase/cerramos-c686e70540fc.json"
    );
    getSignedUrlMock.mockResolvedValue(["https://upload.example.test"]);
    const processCwdSpy = vi
      .spyOn(process, "cwd")
      .mockReturnValue("/home/sebastian/Desktop/cerramos-codebase/apps/web");
    const { createSignedUploadUrl } = await import("./index");

    await createSignedUploadUrl({
      contentType: "image/png",
      objectKey: "products/commerce_1/images/object.png",
    });

    expect(storageConstructorMock).toHaveBeenCalledWith({
      keyFilename: "/home/sebastian/Desktop/cerramos-codebase/cerramos-c686e70540fc.json",
      projectId: undefined,
    });

    processCwdSpy.mockRestore();
  });

  test("deletes an object using the configured bucket", async () => {
    deleteMock.mockResolvedValue(undefined);
    const { deleteObject } = await import("./index");

    await deleteObject({
      objectKey: "products/commerce_1/images/object.png",
    });

    expect(deleteMock).toHaveBeenCalledWith({ ignoreNotFound: true });
  });

  test("throws when required storage config is missing", async () => {
    delete process.env.GCS_BUCKET_NAME;
    const { createSignedReadUrl } = await import("./index");

    await expect(
      createSignedReadUrl({
        objectKey: "products/commerce_1/images/object.png",
      })
    ).rejects.toThrow();
  });

  test("extracts product object keys from legacy route values and signed storage URLs", async () => {
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    const { extractProductImageObjectKey, normalizeStoredProductImageReference } =
      await import("./product-image");

    expect(
      extractProductImageObjectKey(
        "/api/products/image?objectKey=gs%3A%2F%2Fimagenes-cerramos%2Fproducts%2Fcommerce_1%2Fimages%2Fmate.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      extractProductImageObjectKey(
        "/api/product-link-images?objectKey=gs%3A%2F%2Fimagenes-cerramos%2Fproducts%2Fcommerce_1%2Fimages%2Fmate.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      extractProductImageObjectKey(
        "https://storage.googleapis.com/imagenes-cerramos/products/commerce_1/images/mate.png?X-Goog-Algorithm=GOOG4-RSA-SHA256",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      normalizeStoredProductImageReference(
        "/api/products/image?objectKey=products%2Fcommerce_1%2Fimages%2Fmate.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("products/commerce_1/images/mate.png");
    expect(
      normalizeStoredProductImageReference(
        "https://cdn.example.com/product.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("https://cdn.example.com/product.png");
  });

  test("extracts commerce logo object keys from public and app route URLs", async () => {
    process.env.GCS_BUCKET_NAME = "imagenes-cerramos";
    const { extractCommerceLogoObjectKey, normalizeStoredCommerceLogoReference } =
      await import("./commerce-logo");

    expect(
      extractCommerceLogoObjectKey(
        "/api/commerce-logos?objectKey=commerces%2Fuser_1%2Flogos%2Flogo.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("commerces/user_1/logos/logo.png");
    expect(
      extractCommerceLogoObjectKey(
        "/api/commerce/logo?objectKey=gs%3A%2F%2Fimagenes-cerramos%2Fcommerces%2Fuser_1%2Flogos%2Flogo.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("commerces/user_1/logos/logo.png");
    expect(
      normalizeStoredCommerceLogoReference(
        "https://cdn.example.com/logo.png",
        process.env.GCS_BUCKET_NAME
      )
    ).toBe("https://cdn.example.com/logo.png");
  });
});
