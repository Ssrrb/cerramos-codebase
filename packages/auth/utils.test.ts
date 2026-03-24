import { describe, expect, test } from "vitest";
import {
  buildTrustedOrigins,
  getCrossSubDomainCookieOptions,
  mapSessionUserToAuthUser,
  slugifyCommerceName,
} from "./utils";

describe("auth utils", () => {
  test("buildTrustedOrigins deduplicates origins", () => {
    expect(
      buildTrustedOrigins([
        "https://app.example.com/sign-in",
        "https://app.example.com/api/auth",
        "https://www.example.com",
        undefined,
      ])
    ).toEqual(["https://app.example.com", "https://www.example.com"]);
  });

  test("getCrossSubDomainCookieOptions is opt-in", () => {
    expect(getCrossSubDomainCookieOptions()).toBeUndefined();
    expect(getCrossSubDomainCookieOptions(".example.com")).toEqual({
      domain: ".example.com",
      enabled: true,
    });
  });

  test("mapSessionUserToAuthUser preserves compatibility shape", () => {
    expect(
      mapSessionUserToAuthUser({
        commerceId: "commerce_123",
        customerId: "customer_123",
        email: "owner@example.com",
        id: "user_123",
        image: "https://example.com/avatar.png",
        name: "Commerce Owner",
        role: "merchant_admin",
      })
    ).toEqual({
      emailAddresses: [{ emailAddress: "owner@example.com" }],
      fullName: "Commerce Owner",
      id: "user_123",
      imageUrl: "https://example.com/avatar.png",
      privateMetadata: {
        commerceId: "commerce_123",
        customerId: "customer_123",
        role: "merchant_admin",
      },
    });
  });

  test("slugifyCommerceName normalizes accents and punctuation", () => {
    expect(slugifyCommerceName("  Café Ñandutí / Shop  ")).toBe(
      "cafe-nanduti-shop"
    );
    expect(slugifyCommerceName("!!!")).toBe("commerce");
  });
});
