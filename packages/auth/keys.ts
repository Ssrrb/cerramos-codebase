import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      AUTH_SESSION_SECRET: z.string().min(32).optional(),
      AUTH_COOKIE_NAME: z.string().min(1).optional(),
      AUTH_PASSWORD_PEPPER: z.string().min(16).optional(),
      AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
      AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
      AUTH_GOOGLE_CALLBACK_URL: z.url().optional(),
    },
    client: {
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: z.string().startsWith("/").optional(),
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: z.string().startsWith("/").optional(),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL: z
        .string()
        .startsWith("/")
        .optional(),
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL: z
        .string()
        .startsWith("/")
        .optional(),
    },
    runtimeEnv: {
      AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
      AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
      AUTH_PASSWORD_PEPPER: process.env.AUTH_PASSWORD_PEPPER,
      AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
      AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      AUTH_GOOGLE_CALLBACK_URL: process.env.AUTH_GOOGLE_CALLBACK_URL,
      NEXT_PUBLIC_AUTH_SIGN_IN_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_SIGN_UP_URL: process.env.NEXT_PUBLIC_AUTH_SIGN_UP_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL:
        process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL:
        process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL,
    },
  });
