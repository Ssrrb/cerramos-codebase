# Cerramos Monorepo

Cerramos is a Bun and Turborepo workspace for the buyer checkout flow, merchant operations, and shared platform modules.

Start with `docs/content/docs/product/` for product scope, architecture, and repo rules.
Runtime surfaces live in `apps/`. Shared capabilities live in `packages/`.

Keep order state and payment state separate.
Treat merchant-facing product surfaces as the operational source of truth.

Local boundary docs exist only in:
- `apps/app`, `apps/api`, `apps/web`, `apps/docs`
- `packages/database`, `packages/payments`
- `scripts`, `turbo`
