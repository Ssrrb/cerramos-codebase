import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      GCS_BUCKET_NAME: z.string().min(1),
      GCS_READ_URL_TTL_SECONDS: z.coerce.number().int().positive().optional(),
      GCS_UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive().optional(),
      GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
      GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
    },
    runtimeEnv: {
      GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
      GCS_READ_URL_TTL_SECONDS: process.env.GCS_READ_URL_TTL_SECONDS,
      GCS_UPLOAD_URL_TTL_SECONDS: process.env.GCS_UPLOAD_URL_TTL_SECONDS,
      GOOGLE_APPLICATION_CREDENTIALS:
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    },
  });
