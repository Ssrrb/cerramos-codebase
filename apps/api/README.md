# API Surface

`apps/api` owns API-only runtime entrypoints such as health checks, cron handlers, and inbound webhooks.

Keep routes thin, explicit, and idempotent.
Put shared provider or domain logic in `packages/*`, especially `packages/payments` and `packages/database`.

Do not move merchant UI concerns here.
Do not treat webhook handlers as the owner of operational state.
