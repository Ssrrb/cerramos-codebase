import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { betterAuthServer, trustedOrigins } from "./server";

const ALLOWED_METHODS = "GET, POST, PATCH, PUT, DELETE, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "content-type";

const rawHandlers = toNextJsHandler(betterAuthServer);

const isConnectionError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const cause = (error as { cause?: unknown }).cause;

  if (
    cause &&
    typeof cause === "object" &&
    (cause as { constructor?: { name?: string } }).constructor?.name ===
      "ErrorEvent"
  ) {
    return true;
  }

  const message = (error as { message?: string }).message ?? "";

  return (
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("pool") ||
    message.includes("ErrorEvent")
  );
};

const wrapHandler = (
  handler: (req: Request, ...args: unknown[]) => Promise<Response>
) => {
  return async (request: Request, ...args: unknown[]) => {
    try {
      // Warm database before Better Auth processes the request.
      // OAuth state verification (parseState) reads from the verification
      // table — a cold DB causes state_mismatch because Better Auth handles
      // the error internally and redirects, never reaching our catch block.
      const { warmDatabaseConnection } = await import("@repo/database");
      await warmDatabaseConnection();
      return await handler(request, ...args);
    } catch (error) {
      if (isConnectionError(error)) {
        return Response.json(
          { error: "Database connection unavailable. Please try again." },
          { status: 503 }
        );
      }

      throw error;
    }
  };
};

export const GET = wrapHandler(rawHandlers.GET);
export const POST = wrapHandler(rawHandlers.POST);
export const PUT = wrapHandler(rawHandlers.PUT);
export const PATCH = wrapHandler(rawHandlers.PATCH);
export const DELETE = wrapHandler(rawHandlers.DELETE);

export const OPTIONS = async (request: Request) => {
  const origin = request.headers.get("origin");
  const requestedHeaders =
    request.headers.get("access-control-request-headers") ??
    DEFAULT_ALLOWED_HEADERS;

  if (!(origin && trustedOrigins.includes(origin))) {
    return new Response(null, {
      headers: {
        Vary: "Origin, Access-Control-Request-Headers",
      },
      status: 403,
    });
  }

  return new Response(null, {
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": requestedHeaders,
      "Access-Control-Allow-Methods": ALLOWED_METHODS,
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin, Access-Control-Request-Headers",
    },
    status: 204,
  });
};
