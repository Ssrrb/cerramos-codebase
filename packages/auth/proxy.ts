import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

type MiddlewareCallback = (
  auth: {
    userId: string | null;
    orgId: string | null;
    sessionId: string | null;
  },
  request: NextRequest,
  event: NextFetchEvent
) => Response | Promise<Response | undefined> | undefined;

export const authMiddleware = (callback?: MiddlewareCallback) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await callback?.(
      {
        userId: null,
        orgId: null,
        sessionId: null,
      },
      request,
      event
    );

    return response ?? NextResponse.next();
  };
};
