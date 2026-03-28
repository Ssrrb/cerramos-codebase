# Customization

## Contents

- [Swapping Providers](#swapping-providers)
- [Deployment to Vercel](#deployment-to-vercel)
- [Adding New Apps](#adding-new-apps)
- [Adding New Packages](#adding-new-packages)
- [Design System Theming](#design-system-theming)
- [Extending Features](#extending-features)

## Swapping Providers

next-forge is modular, but this repo has already diverged from the original starter. Distinguish between starter defaults and current-repo defaults before recommending changes.

### Database / ORM

**Current repo default**: Drizzle + Neon serverless + PostgreSQL

To swap:
- update `packages/database/`
- replace `database` exports and schema definitions
- update migration commands if the new stack is not Drizzle-based
- review all consumers importing `database`, `schema`, or Drizzle helpers

If you are only changing the PostgreSQL host, do not treat that as an ORM migration; it is usually just a `DATABASE_URL` change.

### Authentication

**Current repo default**: Better Auth

To swap:
- replace `packages/auth/server.ts`, `packages/auth/handlers.ts`, and related helpers
- update `apps/app/app/api/auth/[...all]/route.ts`
- review auth-dependent UI in unauthenticated routes and shared provider usage
- update database tables if the provider changes session/account models

Do not tell users to update Clerk components unless you first clarify that Clerk is a starter-era reference, not the current repo state.

### Payments

**Current repo default**: PagoPar/uPay-oriented adapter

To swap:
- replace or extend `packages/payments/`
- update `apps/api/app/webhooks/payments/route.ts`
- update any app-level payment status handling that assumes current enum values

If introducing Stripe, add the Stripe SDK and webhook verification flow explicitly rather than assuming it already exists.

### CMS

**Current repo default**: BaseHub, but optional in local development

To swap:
- update `packages/cms/`
- update content queries and rendering in `apps/web`

### Documentation

**Current repo default**: Mintlify app in `apps/docs`

Do not confuse this with the separate root `docs/` directory in the repo, which is not the active deployable docs app described by the workspace scripts.

### Design System

**Current repo default**: shared shadcn/ui-based system in `packages/design-system`

When customizing design, check whether the relevant UI already lives in:
- `packages/design-system` for shared primitives
- `apps/app/app/components` for app-local UI
- `apps/web/components` for marketing-only UI

### Email

**Current repo default**: React Email templates with Resend-style package integration

To swap providers:
- change the sending client in `packages/email`
- keep or replace the React Email templates depending on the goal
- preserve `apps/email` if you still want local template preview

## Deployment to Vercel

Treat `app`, `web`, and `api` as separate projects unless the repo has been explicitly consolidated.

Suggested mapping:
1. `apps/app`
2. `apps/web`
3. `apps/api`

Additional deployable surfaces may exist depending on the team workflow:
- `apps/docs`
- `apps/storybook`

### Environment Variables on Vercel

Prefer shared environment variables for common cross-app settings:

```bash
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_WEB_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_DOCS_URL=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
```

Then add provider-specific values only to the apps that need them.

### Production URLs

Update inter-app URLs to production domains:

```bash
NEXT_PUBLIC_APP_URL="https://app.yourdomain.com"
NEXT_PUBLIC_WEB_URL="https://www.yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_DOCS_URL="https://docs.yourdomain.com"
BETTER_AUTH_URL="https://app.yourdomain.com"
```

## Adding New Apps

1. Create a new directory under `apps/`.
2. Add a `package.json` with workspace scripts.
3. Import only the `@repo/*` packages that app actually needs.
4. Ensure the app has a clear port and deployment role.
5. Rely on Turbo defaults unless you need custom tasks.

## Adding New Packages

1. Create a new directory under `packages/`.
2. Use the `@repo/<name>` naming convention.
3. Export a clear public API.
4. Add `keys.ts` if the package owns env vars.
5. Compose that package's env schema into the consuming apps' `env.ts`.

This last step matters in this repo because env composition is app-specific.

## Design System Theming

Update theming through the shared design system first, then only add app-local overrides where needed.

Check:
- `packages/design-system`
- app-local global CSS files
- font utilities in shared packages before duplicating font setup per app

## Extending Features

### Adding API Routes

Add routes in `apps/api/app/` when the endpoint should live on the dedicated API surface. For app-specific authenticated routes, `apps/app/app/api/` may still be the correct location.

### Adding Auth Endpoints

The Better Auth catch-all route already lives in:

```text
apps/app/app/api/auth/[...all]/route.ts
```

Prefer extending `@repo/auth` instead of adding parallel auth stacks.

### Adding Webhook Handlers

Inbound webhooks belong in `apps/api/app/webhooks/`. Verify signatures in the route using the provider package.

### Adding Database Models

Add tables and enums in `packages/database/schema.ts`, then run the Drizzle migration flow.

### Adding Email Templates

Create templates in `packages/email/templates` and preview them through `apps/email`.
