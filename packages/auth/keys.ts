import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isDevelopment = process.env.NODE_ENV === "development";
const emptyStringAsUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

export const keys = () =>
  createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(32),
      BETTER_AUTH_URL: z.url(),
      BETTER_AUTH_COOKIE_DOMAIN: emptyStringAsUndefined(
        z.string().min(1).optional()
      ),
      AUTH_GOOGLE_CLIENT_ID: emptyStringAsUndefined(
        z.string().min(1).optional()
      ),
      AUTH_GOOGLE_CLIENT_SECRET: emptyStringAsUndefined(
        z.string().min(1).optional()
      ),
    },
    client: {
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: emptyStringAsUndefined(
        z.string().startsWith("/").optional()
      ),
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: emptyStringAsUndefined(
        z.string().startsWith("/").optional()
      ),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL: emptyStringAsUndefined(
        z.string().startsWith("/").optional()
      ),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL: emptyStringAsUndefined(
        z.string().startsWith("/").optional()
      ),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        (isDevelopment
          ? "dev_better_auth_secret_change_me_before_production_123456"
          : undefined),
      BETTER_AUTH_URL:
        process.env.BETTER_AUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        (isDevelopment ? "http://localhost:3000" : undefined),
      BETTER_AUTH_COOKIE_DOMAIN: process.env.BETTER_AUTH_COOKIE_DOMAIN,
      AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
      AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_UP_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL:
        process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL:
        process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL,
    },
  });

export const isGoogleAuthEnabled = () => {
  const authKeys = keys();

  return Boolean(
    authKeys.AUTH_GOOGLE_CLIENT_ID && authKeys.AUTH_GOOGLE_CLIENT_SECRET
  );
};
