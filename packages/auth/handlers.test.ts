import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({
    DELETE: vi.fn(),
    GET: vi.fn(),
    PATCH: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
  })),
}));

vi.mock("./server", () => ({
  betterAuthServer: {},
  trustedOrigins: ["http://localhost:3001"],
}));

describe("auth handlers preflight", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("allows preflight requests from trusted origins", async () => {
    const { OPTIONS } = await import("./handlers");

    const response = await OPTIONS(
      new Request("http://localhost:3000/api/auth/sign-in/social", {
        headers: {
          "access-control-request-headers": "content-type,x-client-version",
          origin: "http://localhost:3001",
        },
        method: "OPTIONS",
      })
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3001"
    );
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
      "true"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "content-type,x-client-version"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    expect(response.headers.get("Vary")).toBe(
      "Origin, Access-Control-Request-Headers"
    );
  });

  test("falls back to a safe default allowed header list", async () => {
    const { OPTIONS } = await import("./handlers");

    const response = await OPTIONS(
      new Request("http://localhost:3000/api/auth/sign-in/social", {
        headers: {
          origin: "http://localhost:3001",
        },
        method: "OPTIONS",
      })
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "content-type"
    );
  });

  test("rejects preflight requests from untrusted origins", async () => {
    const { OPTIONS } = await import("./handlers");

    const response = await OPTIONS(
      new Request("http://localhost:3000/api/auth/sign-in/social", {
        headers: {
          origin: "http://localhost:9999",
        },
        method: "OPTIONS",
      })
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeNull();
    expect(response.headers.get("Vary")).toBe(
      "Origin, Access-Control-Request-Headers"
    );
  });
});
