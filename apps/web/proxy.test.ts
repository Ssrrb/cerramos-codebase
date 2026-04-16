import { internationalizationMiddleware } from "@repo/internationalization/proxy";
import { NextRequest } from "next/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("@repo/auth/proxy", () => ({
  authMiddleware: (callback?: unknown) => callback,
}));

vi.mock("@repo/security", () => ({
  secure: vi.fn(),
}));

vi.mock("@repo/security/proxy", () => ({
  noseconeOptions: {},
  noseconeOptionsWithToolbar: {},
  securityMiddleware: () => () => undefined,
}));

vi.mock("@rescale/nemo", () => ({
  createNEMO: () => () => undefined,
}));

vi.mock("@/env", () => ({
  env: {
    ARCJET_KEY: "",
    FLAGS_SECRET: "",
  },
}));

const loadProxyModule = () => import("./proxy");

describe("web i18n middleware", () => {
  test("rewrites default-locale checkout URLs without requiring /en in the path", () => {
    const request = new NextRequest("https://cerramos.test/buy/mate-shop/mate");
    const response = internationalizationMiddleware(request);

    expect(response).toBeDefined();
    expect(response?.headers.get("x-middleware-rewrite") ?? "").toContain(
      "/en/buy/mate-shop/mate"
    );
  });

  test("bypasses product-link image API routes", async () => {
    const { shouldBypassProxy } = await loadProxyModule();
    expect(shouldBypassProxy("/api/product-link-images")).toBe(true);
  });

  test("bypasses commerce logo API routes", async () => {
    const { shouldBypassProxy } = await loadProxyModule();
    expect(shouldBypassProxy("/api/commerce-logos")).toBe(true);
  });

  test("bypasses checkout order API routes", async () => {
    const { shouldBypassProxy } = await loadProxyModule();
    expect(shouldBypassProxy("/api/buy/tienda123/test2/orders")).toBe(true);
  });

  test("continues to process checkout page routes", async () => {
    const { shouldBypassProxy } = await loadProxyModule();
    expect(shouldBypassProxy("/buy/tienda123/test2")).toBe(false);
  });

  test("excludes API routes from the web proxy matcher", async () => {
    const { config } = await loadProxyModule();
    expect(config.matcher).toContain(
      "/((?!api|_next/static|_next/image|ingest|favicon.ico|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
    );
  });
});
