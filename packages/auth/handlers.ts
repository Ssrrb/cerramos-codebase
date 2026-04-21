import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { betterAuthServer, trustedOrigins } from "./server";

const ALLOWED_METHODS = "GET, POST, PATCH, PUT, DELETE, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "content-type";

export const { DELETE, GET, PATCH, POST, PUT } =
  toNextJsHandler(betterAuthServer);

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
