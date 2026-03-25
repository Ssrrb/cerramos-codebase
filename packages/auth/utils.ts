export interface SessionUserLike {
  commerceId?: string | null;
  customerId?: string | null;
  email: string;
  id: string;
  image?: string | null;
  name?: string | null;
  role?: string | null;
}

export interface AuthUser {
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  fullName?: string | null;
  id: string;
  imageUrl?: string | null;
  privateMetadata?: Record<string, unknown>;
}

export interface OrganizationMembership {
  id: string;
  publicUserData?: {
    firstName?: string;
    identifier?: string;
    imageUrl?: string;
    lastName?: string;
    userId?: string;
  };
}

export const AUTH_COOKIE_PREFIX = "cerramos-auth";
export const DEFAULT_AUTH_SIGN_IN_URL = "/sign-in";
export const DEFAULT_AUTH_AFTER_SIGN_IN_URL = "/";
const WHITESPACE_REGEX = /\s+/;

export const buildTrustedOrigins = (
  values: Array<string | undefined>
): string[] => {
  const origins = new Set<string>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    origins.add(new URL(value).origin);
  }

  return [...origins];
};

export const getCrossSubDomainCookieOptions = (domain?: string) => {
  if (!domain) {
    return undefined;
  }

  return {
    domain,
    enabled: true,
  } as const;
};

export const mapSessionUserToAuthUser = (user: SessionUserLike): AuthUser => ({
  emailAddresses: [{ emailAddress: user.email }],
  fullName: user.name ?? null,
  id: user.id,
  imageUrl: user.image ?? null,
  privateMetadata: {
    commerceId: user.commerceId ?? null,
    customerId: user.customerId ?? null,
    role: user.role ?? null,
  },
});

export const toMembership = (
  user: Pick<SessionUserLike, "email" | "id" | "image" | "name">
): OrganizationMembership => {
  const [firstName, ...rest] = (user.name ?? "").trim().split(WHITESPACE_REGEX);
  const lastName = rest.join(" ").trim();

  return {
    id: user.id,
    publicUserData: {
      firstName: firstName || undefined,
      identifier: user.email,
      imageUrl: user.image ?? undefined,
      lastName: lastName || undefined,
      userId: user.id,
    },
  };
};

export const slugifyCommerceName = (value: string): string => {
  const normalized = value
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

  return normalized || "commerce";
};

export const normalizeReturnTo = (value?: string | null): string | null => {
  if (!(value && value.startsWith("/")) || value.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(value, "http://localhost");

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

export const buildAuthRedirectUrl = (
  pathname: string,
  returnTo?: string | null
): string => {
  const safeReturnTo = normalizeReturnTo(returnTo);

  if (!safeReturnTo) {
    return pathname;
  }

  const url = new URL(pathname, "http://localhost");
  url.searchParams.set("returnTo", safeReturnTo);

  return `${url.pathname}${url.search}`;
};
