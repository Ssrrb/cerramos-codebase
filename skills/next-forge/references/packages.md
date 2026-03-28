# Packages

## Contents

- [Authentication (`@repo/auth`)](#authentication-repoauth)
- [Database (`@repo/database`)](#database-repodatabase)
- [Payments (`@repo/payments`)](#payments-repopayments)
- [Email (`@repo/email`)](#email-repoemail)
- [CMS (`@repo/cms`)](#cms-repocms)
- [Design System (`@repo/design-system`)](#design-system-repodesign-system)
- [Analytics (`@repo/analytics`)](#analytics-repoanalytics)
- [Observability (`@repo/observability`)](#observability-repoobservability)
- [Storage (`@repo/storage`)](#storage-repostorage)
- [Security (`@repo/security`)](#security-reposecurity)
- [SEO (`@repo/seo`)](#seo-reposeo)
- [Feature Flags (`@repo/feature-flags`)](#feature-flags-repofeature-flags)
- [Internationalization (`@repo/internationalization`)](#internationalization-repointernationalization)
- [Webhooks (`@repo/webhooks`)](#webhooks-repowebhooks)
- [Notifications (`@repo/notifications`)](#notifications-reponotifications)
- [Collaboration (`@repo/collaboration`)](#collaboration-repocollaboration)
- [AI (`@repo/ai`)](#ai-repoai)
- [Rate Limit (`@repo/rate-limit`)](#rate-limit-reporate-limit)
- [Next Config (`@repo/next-config`)](#next-config-reponext-config)
- [TypeScript Config (`@repo/typescript-config`)](#typescript-config-repotypescript-config)

All packages live in `/packages/` and are imported as `@repo/<name>`.

## Authentication (`@repo/auth`)

**Provider**: Better Auth

Handles session management, email/password auth, optional Google auth, and auth route handlers for the `app` surface.

**Key entrypoints**:
- `@repo/auth/server` - server auth instance and session helpers
- `@repo/auth/handlers` - Next.js route handlers exported into `apps/app/app/api/auth/[...all]/route.ts`
- `@repo/auth/provider` - lightweight provider wrapper

**Current behavior**:
- Uses `better-auth`
- Persists through the Drizzle adapter against `@repo/database`
- Adds app-specific user fields like `role`, `commerceId`, and `customerId`

**Important repo detail**:
- `apps/api/app/webhooks/auth/route.ts` returns `410`; external auth webhooks are not part of the active flow

**Swappable to**: Auth.js, Clerk, Supabase Auth, or another provider, but that would require replacing the Better Auth server and route surface rather than just changing a UI component.

## Database (`@repo/database`)

**ORM**: Drizzle
**Driver**: Neon serverless
**Database**: PostgreSQL

**Key exports**:
- `database` - Drizzle client instance
- `schema` - exported Drizzle schema namespace
- `sql` - Drizzle SQL helper

**Usage**:

```typescript
import { database, schema } from "@repo/database";
import { eq } from "drizzle-orm";

const users = await database
  .select()
  .from(schema.user)
  .where(eq(schema.user.emailVerified, true));
```

**Key files**:
- `packages/database/index.ts`
- `packages/database/schema.ts`
- `packages/database/drizzle.config.ts`
- `packages/database/drizzle/*.sql`

**Migrations**:
- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:push`
- `bun run db:studio`

Do not reference Prisma schema files or Prisma Client for this repo.

## Payments (`@repo/payments`)

**Provider default in this repo**: PagoPar/uPay-style adapter

**Key exports**:
- `pagopar` - config-derived provider object when configured
- `normalizeStatus`
- `verifyWebhook`
- `parseWebhook`
- `PaymentProviderAdapter` - interface for future provider implementations

**Current behavior**:
- The package is intentionally thin
- Webhook verification uses `PAGOPAR_WEBHOOK_SECRET`
- `apps/api/app/webhooks/payments/route.ts` logs, normalizes, and tracks inbound payment events

**Swappable to**: Stripe, Paddle, Lemon Squeezy, or a fuller PagoPar implementation

When advising changes, mention both the package and the webhook route in `apps/api`.

## Email (`@repo/email`)

**Provider**: Resend + React Email

**Templates**: `packages/email/templates`

Preview and development happen through `apps/email`, not inside the package itself.

## CMS (`@repo/cms`)

**Provider**: BaseHub

**Notes**:
- `BASEHUB_TOKEN` is optional
- The package `dev` script no-ops when the token is missing

Use repo reality first when answering CMS questions; do not assume BaseHub is always active locally.

## Design System (`@repo/design-system`)

**Library**: shadcn/ui-based shared component system

This package holds common UI primitives, utilities, and provider composition used across apps. Check the package entrypoints before assuming a component already exists in the shared layer; this repo also contains app-local components in `apps/app/app/components`.

## Analytics (`@repo/analytics`)

Handles analytics integrations for server and client surfaces. Inspect `provider.tsx`, `server.ts`, and `keys.ts` when the user asks which provider is active in a given surface.

## Observability (`@repo/observability`)

Holds error parsing, logging, and observability glue used by apps. In webhook and API flows, prefer pointing to the real helper modules consumed by routes instead of describing generic template behavior.

## Storage (`@repo/storage`)

Shared storage abstraction package. Verify the exported API in the package before suggesting upload usage because storage integrations are often customized per repo.

## Security (`@repo/security`)

Shared security helpers and env validation. The `web` app imports `@arcjet/next`, and both `web` and `app` consume package-level security behavior.

## SEO (`@repo/seo`)

Shared SEO helpers for metadata and related page concerns. When the user asks where metadata is generated, check the consuming app routes first and then the shared package helpers.

## Feature Flags (`@repo/feature-flags`)

Feature-flag support with optional `FLAGS_SECRET`. Treat it as optional infrastructure unless the user is actively working on flags.

## Internationalization (`@repo/internationalization`)

Shared i18n package used primarily by the marketing surface. Verify actual route and middleware usage in `apps/web` before describing locale handling.

## Webhooks (`@repo/webhooks`)

Shared outbound or cross-app webhook utilities. For inbound webhooks, point users first to the concrete route handlers in `apps/api/app/webhooks/*`.

## Notifications (`@repo/notifications`)

Shared notifications package used by the authenticated app. Check package exports and consuming components when the user asks how feeds or triggers are wired.

## Collaboration (`@repo/collaboration`)

Shared real-time collaboration package used by the authenticated app. The active route for auth lives in `apps/app/app/api/collaboration/auth/route.ts`.

## AI (`@repo/ai`)

Shared AI integration package. Read the local package files before describing models or provider defaults because these tend to drift quickly.

## Rate Limit (`@repo/rate-limit`)

Shared rate-limiting helpers, used notably by the `web` surface.

## Next Config (`@repo/next-config`)

Shared Next.js config and env helpers. Check this package when the user asks about URL defaults or shared Next.js setup.

## TypeScript Config (`@repo/typescript-config`)

Workspace-wide TypeScript base configs consumed by apps and packages.
