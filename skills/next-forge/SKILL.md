---
name: next-forge
description: Help Codex work in a next-forge starter or a repo derived from next-forge by covering workspace setup, app and package ownership, environment variables, provider swaps, debugging, deployment, and starter-to-repo drift. Use when the user asks where code lives in a next-forge-style monorepo, how to run or bootstrap it, how to extend or replace an app or package, or how to reconcile published next-forge guidance with the current repository state.
---
# next-forge

Use this skill as an operator's guide for next-forge. Keep the skill lean, answer simple questions from memory, and read only the reference file that matches the task.

## Start Here

1. Confirm whether the user is working from an existing next-forge repo or creating a new one.
2. Identify the task shape before reading references:
   - Setup, install, env vars, migrations, local development: read `references/setup.md`
   - Repo layout, apps, packages, scripts, Turborepo behavior: read `references/architecture.md`
   - Package responsibilities, exports, package-level integration details: read `references/packages.md`
   - Swapping providers, extending features, deployment, theming: read `references/customization.md`
3. Prefer the narrowest possible answer. Do not restate the entire framework when the user asked for one package, one env var, or one workflow.
4. When the request touches the codebase, inspect the local repo and answer from the actual files first. Use the references to interpret next-forge conventions, not to override what exists on disk.
5. If the change is structurally large in this repo, read the relevant docs under `docs/content/docs/product/` before proposing cross-cutting refactors.

## Working Rules

- Treat next-forge as a modular Turborepo template with multiple apps under `apps/` and shared packages under `packages/`.
- Separate starter defaults from repo reality. Explicitly label which is which.
- Treat checked-in source as the source of truth even if root metadata still references the original starter.
- Assume PostgreSQL is the only always-on infrastructure. Most provider integrations should degrade gracefully when their env vars are absent.
- In this repo, prefer the current workspace defaults over starter-era assumptions: Drizzle for the database layer, Better Auth for auth, a PagoPar/uPay-oriented payments adapter, and product routes spread across `apps/app`, `apps/web`, and `apps/api`.
- Keep answers aligned with App Router conventions: server components by default, client components only where interactivity is needed.
- Preserve the `@repo/<name>` package naming convention unless the user is explicitly reworking the workspace structure.
- Prefer incremental changes inside the existing package boundaries instead of cross-cutting rewrites.
- When the user asks about env vars, inspect `packages/*/keys.ts`, root scripts, and the consuming app `env.ts` before answering.
- In this repo, do not collapse order state and payment state into one model, and do not treat messaging channels as the source of truth for operational state.

## Default Operating Flow

### Setup or bootstrap requests

1. Read `references/setup.md`.
2. Verify prerequisites, install command, required env vars, database setup, and local dev commands.
3. Call out which variables are mandatory versus optional.
4. If the user is blocked, inspect the repo's actual `.env*`, package scripts, and package-level `keys.ts` files.
5. If the request is about this repo rather than the published starter, prefer `bun run dev`, `bun run build`, `bun run test`, `bun run check`, `bun run fix`, and the Drizzle commands from the root `package.json`.

### Architecture or navigation requests

1. Read `references/architecture.md`.
2. Map the request to the correct app or package.
3. Explain ownership clearly:
   - `apps/*` are deployable surfaces.
   - `packages/*` hold shared capabilities imported as `@repo/*`.
4. Mention root scripts or Turbo filtering only if they help solve the task.
5. For API ownership questions, distinguish:
   - `apps/app/app/api/*` for authenticated product operations
   - `apps/web/app/api/*` for public commerce and media flows
   - `apps/api/app/*` for health, cron, and inbound webhooks

### Package-specific questions

1. Read `references/packages.md`.
2. Identify the package's provider, key exports, and runtime location.
3. Check the local package implementation before recommending code changes.
4. If the user is integrating a feature, point them to the real entrypoints and webhook routes rather than summarizing package marketing copy.

### Customization or deployment requests

1. Read `references/customization.md`.
2. Preserve package boundaries when swapping providers.
3. Mention all files that typically need changes: package implementation, env validation, webhook handlers, and consuming app usage.
4. For Vercel deployment, treat `app`, `web`, and `api` as separate projects unless the repo clearly diverged.
5. If a change crosses auth, payments, or database boundaries, inspect the live routes before recommending edits.

## Answering Guidance

- Distinguish template defaults from repo-specific reality. Say "next-forge defaults to ..." when you are describing the starter, and "this repo currently ..." when you inspected the workspace.
- When debugging env issues, look for package-local `keys.ts`, `.env.local`, and `packages/database/.env` before guessing.
- When env behavior matters, prefer the runtime fallbacks in `packages/database/keys.ts`, `packages/auth/keys.ts`, and `packages/next-config/keys.ts` over assumptions from older docs.
- When recommending provider swaps, mention the minimal surface area to change first: the owning package, any webhook routes, and any provider-specific UI or middleware.
- When the user asks "where does X live?", answer with the most likely app or package first, then verify against the repo.
- When the user asks for routes or entrypoints, prefer exact paths over package summaries.
- When a reference is likely to have drifted, verify with local files instead of trusting the skill.
- Do not duplicate the long package catalog or setup checklist in your response unless the user explicitly wants an overview.

## Reference Map

- `references/setup.md`
  Use for installation, prerequisites, env vars, database bootstrap, auth/payment setup, and local development commands.
- `references/architecture.md`
  Use for app/package layout, Turbo tasks, scripts, filtering, and build outputs.
- `references/packages.md`
  Use for package-by-package responsibilities, exports, webhook endpoints, and provider defaults.
- `references/customization.md`
  Use for swapping providers, adding apps/packages, deployment patterns, theming, and feature extensions.
