import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { keys } from "./keys";

export interface AuthUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  fullName?: string | null;
  imageUrl?: string | null;
  privateMetadata?: Record<string, unknown>;
}

export interface OrganizationMembership {
  id: string;
  publicUserData?: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    identifier?: string;
    imageUrl?: string;
  };
}

export interface AuthContext {
  userId: string | null;
  orgId: string | null;
  sessionId: string | null;
  redirectToSignIn: () => never;
}

const buildRedirectToSignIn = () => () => {
  const signInUrl = keys().NEXT_PUBLIC_AUTH_SIGN_IN_URL ?? "/sign-in";
  return redirect(signInUrl);
};

export const auth = async (): Promise<AuthContext> => {
  const cookieStore = await cookies();
  const sessionCookieName = keys().AUTH_COOKIE_NAME ?? "cerramos_session";
  const sessionCookie = cookieStore.get(sessionCookieName)?.value ?? null;

  return {
    userId: null,
    orgId: null,
    sessionId: sessionCookie,
    redirectToSignIn: buildRedirectToSignIn(),
  };
};

export const currentUser = async (): Promise<AuthUser | null> => null;

export const clerkClient = async () => ({
  organizations: {
    getOrganizationMembershipList: async (
      _options?: Record<string, unknown>
    ) => ({
      data: [] as OrganizationMembership[],
    }),
  },
  users: {
    getUserList: async (_options?: Record<string, unknown>) => ({
      data: [] as AuthUser[],
    }),
  },
});
