import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  fromMock,
  getSessionCookieMock,
  getSessionMock,
  innerJoinMock,
  limitMock,
  orderByMock,
  redirectMock,
  selectMock,
  whereMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getSessionCookieMock: vi.fn(),
  getSessionMock: vi.fn(),
  innerJoinMock: vi.fn(),
  limitMock: vi.fn(),
  orderByMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
  selectMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  database: {
    select: selectMock,
  },
  schema: {
    commerce: {
      id: "commerce.id",
      logoImageUrl: "commerce.logoImageUrl",
      name: "commerce.name",
      slug: "commerce.slug",
    },
    user: {
      commerceId: "user.commerceId",
      customerId: "user.customerId",
      email: "user.email",
      id: "user.id",
      image: "user.image",
      name: "user.name",
      role: "user.role",
    },
  },
}));

vi.mock("server-only", () => ({}));

vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: getSessionMock,
    },
  })),
}));

vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(() => ({})),
}));

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
}));

vi.mock("better-auth/next-js", () => ({
  nextCookies: vi.fn(() => ({})),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("./keys", () => ({
  keys: () => ({
    AUTH_GOOGLE_CLIENT_ID: undefined,
    AUTH_GOOGLE_CLIENT_SECRET: undefined,
    BETTER_AUTH_COOKIE_DOMAIN: undefined,
    BETTER_AUTH_SECRET: "12345678901234567890123456789012",
    BETTER_AUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_AUTH_SIGN_IN_URL: "/sign-in",
  }),
}));

describe("auth server commerce context", () => {
  beforeEach(() => {
    vi.resetModules();
    fromMock.mockReset();
    getSessionCookieMock.mockReset();
    getSessionMock.mockReset();
    innerJoinMock.mockReset();
    limitMock.mockReset();
    orderByMock.mockReset();
    redirectMock.mockClear();
    selectMock.mockReset();
    whereMock.mockReset();

    getSessionCookieMock.mockReturnValue("session_123");
    selectMock.mockImplementation(() => ({
      from: fromMock,
    }));
    fromMock.mockImplementation(() => ({
      innerJoin: innerJoinMock,
      orderBy: orderByMock,
      where: whereMock,
    }));
    innerJoinMock.mockImplementation(() => ({
      where: whereMock,
    }));
    orderByMock.mockImplementation(() => ({
      limit: limitMock,
    }));
    whereMock.mockImplementation(() => ({
      limit: limitMock,
    }));
  });

  test("returns authenticated app context from the active commerce record", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([
      {
        id: "commerce_1",
        logoImageUrl: "https://cdn.example.com/logo.png",
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
    ]);

    const { getAuthenticatedAppContext } = await import("./server");

    await expect(getAuthenticatedAppContext()).resolves.toEqual({
      commerce: {
        id: "commerce_1",
        logoImageUrl: "https://cdn.example.com/logo.png",
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
      orgId: "commerce_1",
      user: {
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
        role: "merchant_admin",
      },
    });
  });

  test("uses the database commerce link when the session commerce id is stale", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([
      {
        id: "commerce_1",
        logoImageUrl: null,
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
    ]);

    const { requireCommerceContext } = await import("./server");

    await expect(requireCommerceContext()).resolves.toEqual({
      commerce: {
        id: "commerce_1",
        logoImageUrl: null,
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
      orgId: "commerce_1",
      user: {
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
        role: "merchant_admin",
      },
    });
  });

  test("redirects to onboarding when no linked commerce can be resolved", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        email: "owner@example.com",
        id: "user_1",
        image: null,
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([]);

    const { requireCommerceContext } = await import("./server");

    await expect(requireCommerceContext()).rejects.toThrow("redirect:/onboarding");
  });

  test("redirects to onboarding when the commerce record cannot be loaded", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        email: "owner@example.com",
        id: "user_1",
        image: null,
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([]);

    const { requireCommerceContext } = await import("./server");

    await expect(requireCommerceContext()).rejects.toThrow("redirect:/onboarding");
  });

  test("returns 401 for request handlers when there is no session", async () => {
    getSessionMock.mockResolvedValue(null);

    const { requireCommerceIdForRequest } = await import("./server");
    const response = await requireCommerceIdForRequest();

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(401);
    await expect((response as Response).json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  test("returns 400 for request handlers when no commerce can be resolved", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        email: "owner@example.com",
        id: "user_1",
        image: null,
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([]);

    const { requireCommerceIdForRequest } = await import("./server");
    const response = await requireCommerceIdForRequest();

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(400);
    await expect((response as Response).json()).resolves.toEqual({
      error: "Commerce context is required.",
    });
  });

  test("returns the database commerce id for request handlers when the session cookie is stale", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
      },
    });
    limitMock.mockResolvedValue([
      {
        id: "commerce_1",
        name: "Tienda Centro",
        role: "merchant_admin",
        slug: "tienda-centro",
      },
    ]);

    const { requireCommerceIdForRequest } = await import("./server");

    await expect(requireCommerceIdForRequest()).resolves.toBe("commerce_1");
  });
});
