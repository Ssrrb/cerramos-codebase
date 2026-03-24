import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { betterAuthServer } from "./server";

export const { DELETE, GET, PATCH, POST, PUT } =
  toNextJsHandler(betterAuthServer);
