import { beforeEach, describe, expect, test, vi } from "vitest";
import { betterAuth } from "better-auth";

const {
  fromMock,
  getSessionCookieMock,
  getSessionMock,
  innerJoinMock,
  limitMock,
  orderByMock,
  redirectMock,
  selectMock,
  syncCustomerProfileForUserMock,
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
  syncCustomerProfileForUserMock: vi.fn(),
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

vi.mock("./customer-profile", () => ({
  syncCustomerProfileForUser: syncCustomerProfileForUserMock,
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
    syncCustomerProfileForUserMock.mockReset();
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

  test("configures Better Auth to generate UUID ids in application code", async () => {
    await import("./server");

    expect(betterAuth).toHaveBeenCalled();

    const config = vi.mocked(betterAuth).mock.calls[0]?.[0];
    const generateId = config?.advanced?.database?.generateId;

    expect(generateId).toBeTypeOf("function");
    expect((generateId as (input: { model: string }) => string)({ model: "verification" })).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test("wires Better Auth hooks to keep buyer customer profiles linked", async () => {
    await import("./server");

    const config = vi.mocked(betterAuth).mock.calls[0]?.[0];

    await config?.databaseHooks?.user?.create?.after?.({ id: "user_1" } as any, null);
    await config?.databaseHooks?.user?.update?.after?.({ id: "user_2" } as any, null);
    await config?.databaseHooks?.session?.create?.after?.(
      { userId: "user_3" } as any,
      null
    );

    expect(syncCustomerProfileForUserMock).toHaveBeenNthCalledWith(1, "user_1");
    expect(syncCustomerProfileForUserMock).toHaveBeenNthCalledWith(2, "user_2");
    expect(syncCustomerProfileForUserMock).toHaveBeenNthCalledWith(3, "user_3");
  });

  test("returns authenticated app context from the active commerce record", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: "commerce_1",
        email: "owner@example.com",
        id: "user_1",
        image: "https://example.com/avatar.png",
        name: "Sebastian",
        role: "merchant_admin",
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
    expect(innerJoinMock).not.toHaveBeenCalled();
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
    expect(innerJoinMock).toHaveBeenCalledTimes(1);
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

  test("treats session lookup failures as unauthenticated request handlers", async () => {
    getSessionMock.mockRejectedValue(new Error("database offline"));

    const { getSession, requireCommerceIdForRequest } = await import("./server");
    const response = await requireCommerceIdForRequest();

    await expect(getSession()).resolves.toBeNull();
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
