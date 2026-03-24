import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      PAGOPAR_PUBLIC_KEY: z.string().optional(),
      PAGOPAR_PRIVATE_KEY: z.string().optional(),
      PAGOPAR_COMMERCE_ID: z.string().optional(),
      PAGOPAR_BRANCH_ID: z.string().optional(),
      PAGOPAR_API_URL: z.url().optional(),
      PAGOPAR_WEBHOOK_SECRET: z.string().optional(),
    },
    runtimeEnv: {
      PAGOPAR_PUBLIC_KEY: process.env.PAGOPAR_PUBLIC_KEY,
      PAGOPAR_PRIVATE_KEY: process.env.PAGOPAR_PRIVATE_KEY,
      PAGOPAR_COMMERCE_ID: process.env.PAGOPAR_COMMERCE_ID,
      PAGOPAR_BRANCH_ID: process.env.PAGOPAR_BRANCH_ID,
      PAGOPAR_API_URL: process.env.PAGOPAR_API_URL,
      PAGOPAR_WEBHOOK_SECRET: process.env.PAGOPAR_WEBHOOK_SECRET,
    },
  });
