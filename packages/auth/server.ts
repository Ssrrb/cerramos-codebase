import "server-only";

import { database, schema, warmDatabaseConnection } from "@repo/database";
import { log } from "@repo/observability/log";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getSessionCookie } from "better-auth/cookies";
import { nextCookies } from "better-auth/next-js";
import { asc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { syncCustomerProfileForUser } from "./customer-profile";
import { keys } from "./keys";
import {
  type ActiveCommerce,
  AUTH_COOKIE_PREFIX,
  type AuthenticatedAppContext,
  type AuthUser,
  buildTrustedOrigins,
  DEFAULT_AUTH_SIGN_IN_URL,
  getCrossSubDomainCookieOptions,
  mapSessionUserToAuthUser,
  type OrganizationMembership,
  type SessionUserLike,
  toMembership,
} from "./utils";

export type {
  ActiveCommerce,
  AuthenticatedAppContext,
  AuthUser,
  OrganizationMembership,
} from "./utils";

export interface AuthContext {
  orgId: string | null;
  redirectToSignIn: () => never;
  sessionId: string | null;
  userId: string | null;
}

const authKeys = keys();
export const trustedOrigins = buildTrustedOrigins([
  authKeys.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_WEB_URL,
  process.env.NEXT_PUBLIC_API_URL,
]);
const crossSubDomainCookies = getCrossSubDomainCookieOptions(
  authKeys.BETTER_AUTH_COOKIE_DOMAIN
);
const ONBOARDING_URL = "/onboarding";

export const betterAuthServer = betterAuth({
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    crossSubDomainCookies,
    database: {
      // Keep auth IDs explicit and string-backed. This avoids runtime/schema
      // drift when a database was bootstrapped with UUID auth tables.
      generateId: () => crypto.randomUUID(),
    },
  },
  baseURL: authKeys.BETTER_AUTH_URL,
  database: drizzleAdapter(database, {
    provider: "pg",
    schema,
  }),
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await syncCustomerProfileForUser(session.userId);
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          await syncCustomerProfileForUser(user.id);
        },
      },
      update: {
        after: async (user) => {
          await syncCustomerProfileForUser(user.id);
        },
      },
    },
  },
  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
  secret: authKeys.BETTER_AUTH_SECRET,
  //Removed session cookie cache bc after the max age it was not updating the session cookie with the new values, causing stale data to be served from the cookie. Better Auth's session management relies on the session cookie payload for user and commerce context, so it's important to always have the latest data in there.
  socialProviders:
    authKeys.AUTH_GOOGLE_CLIENT_ID && authKeys.AUTH_GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: authKeys.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: authKeys.AUTH_GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  trustedOrigins,
  user: {
    additionalFields: {
      commerceId: {
        input: false,
        required: false,
        type: "string",
      },
      customerId: {
        input: false,
        required: false,
        type: "string",
      },
      role: {
        defaultValue: "buyer",
        input: false,
        required: false,
        type: ["buyer", "merchant_admin", "operator"],
      },
    },
  },
});

type SessionResult = Awaited<
  ReturnType<typeof betterAuthServer.api.getSession>
>;

const getSignInUrl = () =>
  authKeys.NEXT_PUBLIC_AUTH_SIGN_IN_URL ?? DEFAULT_AUTH_SIGN_IN_URL;

const getErrorCauseChain = (error: unknown) => {
  const messages: string[] = [];
  const visited = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);

    const message =
      "message" in current && typeof current.message === "string"
        ? current.message
        : null;

    if (message && !messages.includes(message)) {
      messages.push(message);
    }

    current = "cause" in current ? current.cause : undefined;
  }

  return messages;
};

const getSessionState = cache(async (): Promise<SessionResult> => {
  const requestHeaders = await headers();

  try {
    await warmDatabaseConnection();
    return await betterAuthServer.api.getSession({
      headers: requestHeaders,
    });
  } catch (error) {
    const [
      errorMessage = "Unknown session lookup failure",
      ...errorCauseChain
    ] = getErrorCauseChain(error);

    log.warn("Better Auth session lookup failed", {
      errorCauseChain,
      errorMessage,
    });

    return null;
  }
});

const getSessionToken = cache(async () => {
  const requestHeaders = await headers();

  return getSessionCookie(requestHeaders, {
    cookiePrefix: AUTH_COOKIE_PREFIX,
  });
});

export const hasSessionToken = async () => Boolean(await getSessionToken());

export const getSession = async () => getSessionState();

export const getCurrentCustomerProfile = cache(async () => {
  const session = await getSessionState();

  if (!session?.user.id) {
    return null;
  }

  return syncCustomerProfileForUser(session.user.id);
});

export const requireSession = async () => {
  const session = await getSessionState();

  if (!session) {
    redirect(getSignInUrl());
  }

  return session;
};

const resolveCommerceById = async (
  commerceId: string,
  role: ActiveCommerce["role"]
): Promise<ActiveCommerce | null> => {
  const [commerce] = await database
    .select({
      id: schema.commerce.id,
      logoImageUrl: schema.commerce.logoImageUrl,
      name: schema.commerce.name,
      slug: schema.commerce.slug,
    })
    .from(schema.commerce)
    .where(eq(schema.commerce.id, commerceId))
    .limit(1);

  if (!commerce) {
    return null;
  }

  return {
    ...commerce,
    role,
  };
};

export const getCurrentCommerce = cache(
  async (): Promise<ActiveCommerce | null> => {
    const session = await getSessionState();

    if (!session?.user.id) {
      return null;
    }

    if (session.user.commerceId && session.user.role) {
      const activeCommerce = await resolveCommerceById(
        session.user.commerceId,
        session.user.role
      );

      if (activeCommerce) {
        return activeCommerce;
      }
    }

    // Better Auth caches the session cookie payload, so commerceId can be stale
    // immediately after onboarding completes. Resolve membership from the
    // database by user id and treat the linked commerce as the source of truth.
    const [activeCommerce] = await database
      .select({
        id: schema.commerce.id,
        logoImageUrl: schema.commerce.logoImageUrl,
        name: schema.commerce.name,
        role: schema.user.role,
        slug: schema.commerce.slug,
      })
      .from(schema.user)
      .innerJoin(
        schema.commerce,
        eq(schema.user.commerceId, schema.commerce.id)
      )
      .where(eq(schema.user.id, session.user.id))
      .limit(1);

    if (!activeCommerce) {
      return null;
    }

    return activeCommerce;
  }
);

export const getAuthenticatedAppContext = cache(
  async (): Promise<AuthenticatedAppContext | null> => {
    const [activeCommerce, session] = await Promise.all([
      getCurrentCommerce(),
      getSessionState(),
    ]);

    if (!(activeCommerce && session)) {
      return null;
    }

    return {
      commerce: activeCommerce,
      orgId: activeCommerce.id,
      user: {
        email: session.user.email,
        id: session.user.id,
        image: session.user.image,
        name: session.user.name,
        role: activeCommerce.role,
      },
    };
  }
);

export const requireCommerceContext =
  async (): Promise<AuthenticatedAppContext> => {
    await requireSession();

    const context = await getAuthenticatedAppContext();

    if (!context) {
      redirect(ONBOARDING_URL);
    }

    return context;
  };

export const requireCommerceIdForRequest = async () => {
  const session = await getSessionState();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeCommerce = await getCurrentCommerce();

  if (!activeCommerce) {
    return NextResponse.json(
      { error: "Commerce context is required." },
      { status: 400 }
    );
  }

  return activeCommerce.id;
};

export const requireCommerceContextForRequest = async () => {
  const session = await getSessionState();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await getAuthenticatedAppContext();

  if (!context) {
    return NextResponse.json(
      { error: "Commerce context is required." },
      { status: 400 }
    );
  }

  return context;
};

export const auth = async (): Promise<AuthContext> => {
  const [session, sessionId] = await Promise.all([
    getSessionState(),
    getSessionToken(),
  ]);

  return {
    orgId: session?.user.commerceId ?? null,
    redirectToSignIn: () => redirect(getSignInUrl()),
    sessionId: session ? sessionId : null,
    userId: session?.user.id ?? null,
  };
};

export const currentUser = async (): Promise<AuthUser | null> => {
  const session = await getSessionState();

  if (!session) {
    return null;
  }

  return mapSessionUserToAuthUser(session.user as SessionUserLike);
};

export const listCommerceMembers = async (
  commerceId: string,
  limit = 100
): Promise<OrganizationMembership[]> => {
  const users = await database
    .select({
      email: schema.user.email,
      id: schema.user.id,
      image: schema.user.image,
      name: schema.user.name,
    })
    .from(schema.user)
    .where(eq(schema.user.commerceId, commerceId))
    .orderBy(asc(schema.user.name), asc(schema.user.email))
    .limit(limit);

  return users.map((user) => toMembership(user));
};

export const listUsersById = async (userId?: string | string[]) => {
  let ids: string[] = [];

  if (typeof userId === "string") {
    ids = [userId];
  } else if (Array.isArray(userId)) {
    ids = userId;
  }

  const users = ids.length
    ? await database
        .select({
          commerceId: schema.user.commerceId,
          customerId: schema.user.customerId,
          email: schema.user.email,
          id: schema.user.id,
          image: schema.user.image,
          name: schema.user.name,
          role: schema.user.role,
        })
        .from(schema.user)
        .where(inArray(schema.user.id, ids))
    : [];

  return users.map((user) => mapSessionUserToAuthUser(user));
};
