import { getSessionCookie } from "better-auth/cookies";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_PREFIX } from "./utils";

type MiddlewareCallback = (
  auth: {
    orgId: string | null;
    sessionId: string | null;
    userId: string | null;
  },
  request: NextRequest,
  event: NextFetchEvent
) => Response | Promise<Response | undefined> | undefined;

export const authMiddleware = (callback?: MiddlewareCallback) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const sessionId = getSessionCookie(request, {
      cookiePrefix: AUTH_COOKIE_PREFIX,
    });

    const response = await callback?.(
      {
        orgId: null,
        sessionId,
        userId: null,
      },
      request,
      event
    );

    return response ?? NextResponse.next();
  };
};
