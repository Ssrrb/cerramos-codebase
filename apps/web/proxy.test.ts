import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { internationalizationMiddleware } from "@repo/internationalization/proxy";

describe("web i18n middleware", () => {
  test("rewrites default-locale checkout URLs without requiring /en in the path", () => {
    const request = new NextRequest("https://cerramos.test/buy/mate-shop/mate");
    const response = internationalizationMiddleware(request);

    expect(response).toBeDefined();
    expect(response?.headers.get("x-middleware-rewrite") ?? "").toContain(
      "/en/buy/mate-shop/mate"
    );
  });
});
