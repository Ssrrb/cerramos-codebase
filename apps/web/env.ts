import { keys as auth } from "@repo/auth/keys";
import { keys as cms } from "@repo/cms/keys";
import { keys as database } from "@repo/database/keys";
import { keys as email } from "@repo/email/keys";
import { keys as flags } from "@repo/feature-flags/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as rateLimit } from "@repo/rate-limit/keys";
import { keys as security } from "@repo/security/keys";
import { keys as storage } from "@repo/storage/keys";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  extends: [
    auth(),
    cms(),
    core(),
    database(),
    email(),
    observability(),
    flags(),
    storage(),
    security(),
    rateLimit(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
