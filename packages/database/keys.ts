import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isDevelopment = process.env.NODE_ENV === "development";

export const keys = () =>
  createEnv({
    server: {
      DATABASE_URL: z.url(),
    },
    runtimeEnv: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        (isDevelopment
          ? "postgresql://postgres:postgres@127.0.0.1:5432/postgres"
          : undefined),
    },
  });
