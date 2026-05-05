# Plan: Fix Auth Server DB Errors in Checkout Path

## Problem

Two database queries are failing with `[cause]: [ErrorEvent]` on the checkout path:

1. **Product link checkout query** — the multi-table join from `getPublicProductLinkCheckout()` (Commerce + ProductLink + Product + ProductImage)
2. **Session query** — Better Auth's internal `select from session where token = $1`

Both have a Node.js `ErrorEvent` cause, and the `/api/auth/get-session` endpoint returns 500 after ~11s. This points to a database connection issue (likely Neon cold start, pool timeout, or schema drift) rather than a bad query.

## Root cause hypothesis

Three candidates to investigate:

### 1. Neon connection pool is not resilient to cold starts

The `@neondatabase/serverless` Pool at `packages/database/client.ts` connects lazily. The first query after idle time triggers a Neon cold start (serverless DB wakes up). If the pool's connection timeout is too short, or if Better Auth's internal query retry logic is missing, the `ErrorEvent` fires and bubbles up as a 500.

Check: Does the pool have a `connectionTimeoutMillis` setting? Is there a connection retry/health-check layer?

### 2. Schema migration `0016_verification_value_jsonb` wasn't applied

The recent migration changed `verification.value` from `text` to `jsonb`. If this migration wasn't run against the Neon database, Better Auth's verification flow will fail when it tries to write verification data with the new schema.

Check: Run `bun run migrate` to apply pending migrations. Verify the `verification` table schema matches the Drizzle schema definition.

### 3. The recent checkout-auth-action changes may be triggering concurrent session lookups

The checkout page at `page.tsx` calls `getSession()` (server-side, cached with `React.cache`), then passes `initialAuthUser` to the client component. The `CheckoutAuthAction` component also calls `useSession()` from Better Auth client, which hits `/api/auth/get-session`. If the server-side session fetch and client-side session fetch race each other, and both trigger DB cold starts concurrently, both fail.

Check: Does the client-side `useSession()` call race with the server-rendered session? Is the page's `revalidate = 0` (dynamic) causing double queries?

## Investigation steps (in order)

### Step 1: Verify database schema is migrated

```bash
cd ~/Desktop/cerramos-codebase && bun run migrate
```

Confirm `0016_verification_value_jsonb` is applied. Check the `verification` table has `value` as `jsonb` type.

### Step 2: Add connection pool resilience

In `packages/database/client.ts`:

- Add `connectionTimeoutMillis: 15000` to the Pool config (Neon cold starts take 3-10s)
- Add `idleTimeoutMillis: 30000` 
- Consider adding `max: 5` (connection pool size)
- Add a `databaseHealthCheck` function that does a simple `SELECT 1` with retry logic
- Export it so the app can warm the connection before the first real query

### Step 3: Warm the DB connection on first request

In `apps/web/app/[locale]/(checkout)/buy/[commerceSlug]/[productLinkSlug]/page.tsx`:

- Call `databaseHealthCheck()` or a simple `SELECT 1` before the main query to trigger the Neon cold start proactively (so the real query doesn't time out)

### Step 4: Add error handling for Better Auth session

Better Auth's `toNextJsHandler` at `packages/auth/handlers.ts` delegates directly to Better Auth's handler. If Better Auth's DB query fails, the error propagates unchanged. Consider:

- Wrapping the Better Auth handler to catch DB errors and return a proper 503 instead of a raw 500
- Adding a middleware that warms the DB connection before Better Auth's handler runs

### Step 5: Prevent client-server session race

In `apps/web/app/[locale]/(checkout)/buy/[commerceSlug]/[productLinkSlug]/product-link-checkout-client.tsx`:

- The page already passes `initialAuthUser` from the server-side `getSession()`. Ensure the `CheckoutAuthAction` uses this `initialUser` prop and does NOT call `useSession()` on mount if session data is already available via props.
- Check if Better Auth's `<SessionProvider>` needed for `useSession()` could be avoided in the checkout flow or initialized with the server-provided data.

### Step 6: Verify the new `locale` derivation in checkout-auth-action

The recent commit `da4d06a` changed locale derivation from `useParams<{ locale?: string }>()` to `pathname.split("/")[1]`. Verify this still works correctly for all checkout URL patterns:

```
/en/buy/mate-shop/mate-premium       -> "en"
/es/buy/tienda/producto              -> "es"
/buy/mate-shop/mate-premium          -> "buy"  (wrong!)
```

If the URL doesn't have a locale prefix, the `account/ordenes` and `account/direcciones` links in the dropdown will break.

### Step 7: Add DB query timeout and retry

In `getPublicProductLinkCheckout` (`apps/web/lib/product-links.ts`):

- The try/catch already handles `ProductLink` missing-relation errors. Add handling for `ErrorEvent` / connection errors with retry logic.
- Consider: if the query fails with what looks like a connection error, wait 2s and retry once.

## Files to modify

1. `packages/database/client.ts` — pool config + health check export
2. `apps/web/app/[locale]/(checkout)/buy/[commerceSlug]/[productLinkSlug]/page.tsx` — warm DB connection
3. `packages/auth/handlers.ts` — wrap Better Auth handler with error handling
4. `apps/web/lib/product-links.ts` — retry on connection errors
5. `apps/web/app/[locale]/(checkout)/buy/[commerceSlug]/[productLinkSlug]/checkout-auth-action.tsx` — verify locale derivation, avoid useSession race

## Verification

After fixing, verify the checkout flow end-to-end:

1. Visit `/es/buy/remera-tutienda/tutienda` (the page from the error)
2. It should load the product page without 500 errors
3. The "Ingresar" button should work for both email and Google sign-in
4. If already logged in, the dropdown should show orders and addresses links with correct locale
5. Run `bun run test` to verify no regressions
