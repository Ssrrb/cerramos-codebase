# Fix OAuth state_mismatch on Checkout (localhost:3001)

## Problem

Google OAuth on `localhost:3001/buy/...` fails with `state_mismatch` in the URL.

## Root Cause Analysis

**Better Auth stores OAuth state in the `verification` database table** (NOT in cookies). 
Source: `node_modules/.bun/better-auth@1.5.6+.../dist/state.mjs` lines 31, 59-61

The default `storeStateStrategy` is `database` (the else branch at line 102+). When using database strategy:

1. **State generation** (POST `/api/auth/sign-in/social`): `createVerificationValue()` writes state to the `verification` table
2. **State verification** (GET `/api/auth/callback/google`): `findVerificationValue(state)` reads it back

When Neon DB is cold:
- The POST might succeed (DB warms by then) but the **callback GET** arrives to a cold DB → `findVerificationValue()` fails → Better Auth catches the error internally and redirects to `${errorURL}?error=state_mismatch`
- Or the POST itself fails → no state stored → callback always fails

**Why our prior fix doesn't help this case:** The `warmDatabaseConnection()` was added to the checkout page (`page.tsx`), but the `/api/auth/*` endpoints go through `packages/auth/handlers.ts` which has no pre-warming. Our `wrapHandler` there only catches UNCAUGHT errors, but Better Auth catches DB errors **internally** in `parseState` and converts them to redirects — our wrapper never sees them.

## What Already Exists

| File | Content |
|------|---------|
| `packages/auth/handlers.ts` | Wraps Better Auth `toNextJsHandler()` with connection error detection (returns 503). Already has `warmDatabaseConnection` available from `@repo/database`. |
| `packages/auth/server.ts` | `betterAuth()` config with `plugins: [nextCookies()]`, `trustedOrigins`, `crossSubDomainCookies`, OAuth state stored in DB by default. |
| `packages/database/client.ts` | Exported `warmDatabaseConnection()` — runs `SELECT 1` with up to 2 retries (2s delay). |
| `checkout-auth-action.tsx` | Calls `signIn.social({ provider: "google", callbackURL, ... })` — client code, no changes needed. |
| `.env.local` (web) | `BETTER_AUTH_URL` set to `http://localhost:3001`, `NEXT_PUBLIC_WEB_URL=http://localhost:3001` |

## Tasks (execute in order)

### Task 1: Add DB warm-up to auth handler in handlers.ts

File: `packages/auth/handlers.ts`

Current `wrapHandler` function (our code from the prior fix):
```ts
const wrapHandler = (handler: (req: Request, ...args: unknown[]) => Promise<Response>) => {
  return async (request: Request, ...args: unknown[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      if (isConnectionError(error)) {
        return Response.json(
          { error: "Database connection unavailable. Please try again." },
          { status: 503 }
        );
      }
      throw error;
    }
  };
};
```

Change: **Add `import { warmDatabaseConnection } from "@repo/database";`** at the top, and warm the DB before calling the handler:

```ts
const wrapHandler = (handler: (req: Request, ...args: unknown[]) => Promise<Response>) => {
  return async (request: Request, ...args: unknown[]) => {
    try {
      // Warm database connection BEFORE Better Auth processes the request,
      // especially critical for OAuth state verification which reads from the
      // verification table (database strategy by default in Better Auth 1.5.6).
      await warmDatabaseConnection();
      return await handler(request, ...args);
    } catch (error) {
      if (isConnectionError(error)) {
        return Response.json(
          { error: "Database connection unavailable. Please try again." },
          { status: 503 }
        );
      }
      throw error;
    }
  };
};
```

DO NOT modify anything else in the file. Keep the OPTIONS handler, isConnectionError, exports, etc. unchanged.

### Task 2: Verify migration was applied

Run `bun run --cwd packages/database db:migrate` (as we did before — it should be a no-op now if already applied, but confirm it completes without error).

### Task 3: Run tests

Run `bun run test` and fix any failures.

## Constraints

- Do NOT modify any auth flow logic, sign-in/sign-up forms, or the auth server config
- Do NOT modify the OPTIONS CORS handler
- Do NOT add external dependencies
- The warm-up should be a no-op if the pool is already healthy (it already is — `warmDatabaseConnection` has this behavior)
- Run tests after each task
