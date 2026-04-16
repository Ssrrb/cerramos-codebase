import { authMiddleware } from "@repo/auth/proxy";
import {
  buildAuthRedirectUrl,
  DEFAULT_AUTH_SIGN_IN_URL,
} from "@repo/auth/utils";
import {
  noseconeOptions,
  noseconeOptionsWithToolbar,
  securityMiddleware,
} from "@repo/security/proxy";
import { type NextProxy, NextResponse } from "next/server";
import { env } from "./env";

const securityHeaders = env.FLAGS_SECRET
  ? securityMiddleware(noseconeOptionsWithToolbar)
  : securityMiddleware(noseconeOptions);

const isAuthPage = (pathname: string) =>
  pathname === "/sign-in" ||
  pathname.startsWith("/sign-in/") ||
  pathname === "/sign-up" ||
  pathname.startsWith("/sign-up/");

const isApiRoute = (pathname: string) => pathname.startsWith("/api/");

export default authMiddleware((auth, request) => {
  const { pathname, search } = request.nextUrl;

  if (!(auth.sessionId || isApiRoute(pathname) || isAuthPage(pathname))) {
    const redirectUrl = buildAuthRedirectUrl(
      DEFAULT_AUTH_SIGN_IN_URL,
      `${pathname}${search}`
    );

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return securityHeaders();
}) as unknown as NextProxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
