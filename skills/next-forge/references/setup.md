# Setup

## Contents

- [Prerequisites](#prerequisites)
- [Install Dependencies](#install-dependencies)
- [Required Environment Variables](#required-environment-variables)
- [Optional Environment Variables](#optional-environment-variables)
- [Database Setup](#database-setup)
- [Authentication Setup](#authentication-setup)
- [Payments Setup](#payments-setup)
- [Running Development](#running-development)
- [Environment Variable Validation](#environment-variable-validation)

## Prerequisites

- Bun 1.3.x
- Node.js 18+
- A PostgreSQL database
- Optional CLIs depending on the surface you are working on:
  - Mintlify CLI for `apps/docs`
  - Stripe CLI is no longer part of the default local flow in this repo

## Install Dependencies

From the repository root:

```bash
bun install
```

This repo is an existing Bun-powered Turborepo. Prefer answering from the checked-in scripts rather than repeating the generic `next-forge init` flow unless the user explicitly asked about the starter itself.

## Required Environment Variables

### Database

Set `DATABASE_URL` for `@repo/database`. In development, `packages/database/keys.ts` falls back to `postgresql://postgres:postgres@127.0.0.1:5432/postgres`, but production requires an explicit value.

Typical local placement:

```bash
# packages/database/.env.local
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Local URLs

These are usually defined in app-level `.env.local` files and used by shared packages such as `@repo/auth` and `@repo/next-config`:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WEB_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_DOCS_URL="http://localhost:3004"
```

## Optional Environment Variables

All integrations below are optional unless the feature is being used. The repo generally degrades gracefully when provider env vars are absent.

### Authentication (`@repo/auth`)

This repo uses Better Auth with database-backed sessions.

```bash
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_COOKIE_DOMAIN=""
AUTH_GOOGLE_CLIENT_ID=""
AUTH_GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_AUTH_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_AUTH_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL="/"
```

Notes:
- `BETTER_AUTH_SECRET` is required outside development.
- Google auth is enabled only when both Google vars are present.
- The Better Auth handler lives in `apps/app/app/api/auth/[...all]/route.ts`.

### Payments (`@repo/payments`)

The current default is PagoPar/uPay, not Stripe.

```bash
PAGOPAR_PUBLIC_KEY=""
PAGOPAR_PRIVATE_KEY=""
PAGOPAR_COMMERCE_ID=""
PAGOPAR_BRANCH_ID=""
PAGOPAR_API_URL=""
PAGOPAR_WEBHOOK_SECRET=""
```

If `PAGOPAR_API_URL` is absent, the payment adapter is considered unconfigured.

### CMS (`@repo/cms`)

```bash
BASEHUB_TOKEN=""
```

`packages/cms` skips its dev server when `BASEHUB_TOKEN` is missing.

### Email (`@repo/email`)

```bash
RESEND_TOKEN=""
```

### Analytics (`@repo/analytics`)

```bash
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
```

### Observability (`@repo/observability`)

```bash
SENTRY_ORG=""
SENTRY_PROJECT=""
NEXT_PUBLIC_SENTRY_DSN=""
BETTERSTACK_API_KEY=""
BETTERSTACK_URL=""
```

### Security (`@repo/security`)

```bash
ARCJET_KEY=""
```

### Storage (`@repo/storage`)

```bash
BLOB_READ_WRITE_TOKEN=""
```

### Feature Flags (`@repo/feature-flags`)

```bash
FLAGS_SECRET=""
```

### Notifications (`@repo/notifications`)

```bash
KNOCK_API_KEY=""
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=""
NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID=""
```

### Collaboration (`@repo/collaboration`)

```bash
LIVEBLOCKS_SECRET=""
```

### Webhooks (`@repo/webhooks`)

```bash
SVIX_TOKEN=""
```

## Database Setup

The repo uses Drizzle with Neon serverless driver, not Prisma.

Key files:
- `packages/database/schema.ts`
- `packages/database/drizzle.config.ts`
- `packages/database/drizzle/*.sql`

Common commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

Workspace shortcuts from the root:

```bash
bun run migrate        # db:generate + db:migrate
bun run migrate:deploy # db:migrate
```

Current behavior:
- `db:generate` creates SQL migrations from `schema.ts`
- `db:migrate` applies generated migrations
- `db:push` pushes schema changes directly without generating migrations
- `db:studio` opens Drizzle Studio

Do not point users to `prisma/schema.prisma` or Prisma Studio in this repo.

## Authentication Setup

The auth stack is Better Auth backed by Drizzle tables in `@repo/database`.

Relevant files:
- `packages/auth/server.ts`
- `packages/auth/handlers.ts`
- `apps/app/app/api/auth/[...all]/route.ts`

Notes:
- Sessions, accounts, and verifications live in the shared database schema.
- `apps/api/app/webhooks/auth/route.ts` intentionally returns `410` because external auth webhooks are disabled in this repo.

## Payments Setup

Inbound payment webhooks are handled at:

```text
apps/api/app/webhooks/payments/route.ts
```

That route currently verifies a shared secret from `x-cerramos-webhook-secret` and normalizes events through `@repo/payments`.

If the user asks about Stripe CLI or `/api/webhooks/payments` under a Stripe flow, qualify the answer as a template default and then explain that this repo currently uses PagoPar/uPay.

## Running Development

From the repository root:

```bash
bun run dev
```

Scope to a workspace when needed:

```bash
bun run dev --filter app
bun run dev --filter web
bun run dev --filter api
bun run build --filter @repo/database
```

Typical local ports:
- `app`: 3000
- `web`: 3001
- `api`: 3002
- `email`: 3003
- `docs`: 3004
- `storybook`: 6006

## Environment Variable Validation

Environment validation is spread across package-level `keys.ts` files and composed by each app's `env.ts`.

Check these first when debugging missing env vars:
- `packages/*/keys.ts`
- `apps/app/env.ts`
- `apps/web/env.ts`
- `apps/api/env.ts`

The pattern in this repo is:
- shared packages own their own schemas
- apps compose only the package schemas they actually consume
