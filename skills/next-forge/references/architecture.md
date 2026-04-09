# Architecture

## Contents

- [Monorepo Structure](#monorepo-structure)
- [Apps](#apps)
- [Packages](#packages)
- [Package Naming](#package-naming)
- [Turborepo Pipeline](#turborepo-pipeline)
- [Root Scripts](#root-scripts)
- [Filtering](#filtering)
- [Build Outputs](#build-outputs)

## Monorepo Structure

This repo is a Bun-powered Turborepo with deployable apps under `apps/` and shared modules under `packages/`.

```text
next-forge/
├── apps/
│   ├── app/          # Authenticated product app (port 3000)
│   ├── web/          # Public marketing site (port 3001)
│   ├── api/          # API routes, webhooks, health checks (port 3002)
│   ├── email/        # React Email preview (port 3003)
│   ├── docs/         # Mintlify docs (port 3004)
│   └── storybook/    # Component workshop (port 6006)
├── packages/
│   ├── ai
│   ├── analytics
│   ├── auth
│   ├── cms
│   ├── collaboration
│   ├── database
│   ├── design-system
│   ├── email
│   ├── feature-flags
│   ├── internationalization
│   ├── next-config
│   ├── notifications
│   ├── observability
│   ├── payments
│   ├── rate-limit
│   ├── security
│   ├── seo
│   ├── storage
│   ├── typescript-config
│   └── webhooks
├── turbo.json
└── package.json
```

Notes:
- `apps/studio/` exists in the workspace tree but does not have an active app package; database browsing is handled through `bun run db:studio`.
- There is also a root-level `docs/` directory in the repo for other documentation tooling, but the deployable Mintlify app lives in `apps/docs`.

## Apps

### app (Port 3000)

The main authenticated product surface. This repo uses Better Auth with first-party session routes in `apps/app/app/api/auth/[...all]/route.ts`. Product-owned API handlers also live here, including product and product-link routes under `apps/app/app/api/products/*` and `apps/app/app/api/product-links/*`. Collaboration auth lives in `apps/app/app/api/collaboration/auth/route.ts`.

### web (Port 3001)

The public marketing site. It uses `@repo/cms`, `@repo/internationalization`, `@repo/seo`, `@repo/security`, and analytics/observability packages. This repo also exposes public commerce helpers here, including checkout order creation in `apps/web/app/api/buy/[commerceSlug]/[productLinkSlug]/orders/route.ts` and product-link image handling in `apps/web/app/api/product-link-images/route.ts`.

### api (Port 3002)

Dedicated API surface for health checks, cron handlers, and inbound webhooks. In the current repo, auth webhooks are disabled and payment webhooks are handled in `apps/api/app/webhooks/payments/route.ts`.

### email (Port 3003)

React Email preview server pointed at `packages/email/templates`.

### docs (Port 3004)

Mintlify docs app in `apps/docs`.

### storybook (Port 6006)

Storybook instance for design-system and UI development.

## Packages

All shared modules live under `packages/` and are imported as `@repo/<name>`.

Repo-specific defaults worth remembering:
- `@repo/database` uses Drizzle + Neon serverless driver
- `@repo/auth` uses Better Auth, not Clerk
- `@repo/payments` currently exposes a PagoPar/uPay-oriented adapter, not Stripe
- `apps/app` and `apps/web` both own business routes; not every API belongs under `apps/api`

## Package Naming

All packages use the `@repo/<name>` convention:

```typescript
import { database } from "@repo/database";
import { betterAuthServer } from "@repo/auth/server";
import { pagopar } from "@repo/payments";
```

Prefer real exported entrypoints over assumed top-level names. Some packages expose multiple subpaths such as `@repo/auth/server`, `@repo/auth/handlers`, and `@repo/analytics/server`.

## Turborepo Pipeline

Defined in `turbo.json`:

| Task | Dependencies | Outputs | Cached | Persistent |
|------|-------------|---------|--------|------------|
| `build` | `^build`, `test` | `.next`, `storybook-static`, `.react-email`, `**/generated/**` | Yes | No |
| `test` | `^test` | none | Yes | No |
| `analyze` | `^analyze` | none | Yes | No |
| `dev` | none | none | No | Yes |
| `translate` | `^translate` | none | No | No |
| `clean` | none | none | No | No |

Global dependencies include `**/.env.*local`. Environment mode is `loose`.

## Root Scripts

Use the root `package.json` as the source of truth:

| Command | Description |
|---------|-------------|
| `bun run dev` | Start workspace dev tasks through Turbo |
| `bun run build` | Build the workspace |
| `bun run test` | Run tests across apps and packages |
| `bun run check` | Run Ultracite/Biome checks |
| `bun run fix` | Apply automated formatting and lint fixes |
| `bun run analyze` | Run package/app analysis tasks |
| `bun run translate` | Run translation tasks |
| `bun run boundaries` | Check workspace boundaries |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:push` | Push schema directly with Drizzle |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run migrate` | Run `db:generate` then `db:migrate` |
| `bun run migrate:deploy` | Run `db:migrate` |
| `bun run clean` | Clean `node_modules` and generated artifacts |

Do not tell users to run `bun run lint` or `bun run format` unless you first qualify that as a template-era instruction; this repo uses `check` and `fix`.

## Filtering

Use Turbo filters from the repo root:

```bash
bun run dev --filter app
bun run dev --filter web
bun run dev --filter api
bun run build --filter @repo/database
```

## Build Outputs

- `.next/` for Next.js app builds
- `storybook-static/` for Storybook builds
- `.react-email/` for email previews/build output
- `**/generated/**` for generated package artifacts

Older references to Prisma client generation are stale for this repo.
