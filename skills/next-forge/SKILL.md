---
name: next-forge
description: Use when Codex needs to install, configure, customize, debug, extend, or explain a next-forge codebase or starter. Covers questions about project setup, Turborepo architecture, app/package responsibilities, environment variables, provider swaps, Vercel deployment, and next-forge development workflows.
---

# next-forge

Use this skill as an operator's guide for next-forge. Keep the main skill lean, answer from memory when the request is simple, and load only the reference file that matches the user's question.

## Start Here

1. Confirm whether the user is working from an existing next-forge repo or creating a new one.
2. Identify the task shape before reading references:
   - Setup, install, env vars, migrations, local development: read `references/setup.md`
   - Repo layout, apps, packages, scripts, Turborepo behavior: read `references/architecture.md`
   - Package responsibilities, exports, package-level integration details: read `references/packages.md`
   - Swapping providers, extending features, deployment, theming: read `references/customization.md`
3. Prefer the narrowest possible answer. Do not restate the entire framework when the user asked for one package, one env var, or one workflow.
4. When the request touches the codebase, inspect the local repo and answer from the actual files first. Use the references to interpret next-forge conventions, not to override what exists on disk.

## Working Rules

- Treat next-forge as a modular Turborepo template with multiple apps under `apps/` and shared packages under `packages/`.
- Assume PostgreSQL is the only required integration. Other providers are optional and should degrade gracefully when their env vars are absent.
- Keep answers aligned with App Router conventions: server components by default, client components only where interactivity is needed.
- Preserve the `@repo/<name>` package naming convention unless the user is explicitly reworking the workspace structure.
- Prefer incremental changes inside the existing package boundaries instead of cross-cutting rewrites.

## Default Operating Flow

### Setup or bootstrap requests

1. Read `references/setup.md`.
2. Verify prerequisites, install command, required env vars, database setup, and local dev commands.
3. Call out which variables are mandatory versus optional.
4. If the user is blocked, inspect the repo's actual `.env*`, package scripts, and package-level `keys.ts` files.

### Architecture or navigation requests

1. Read `references/architecture.md`.
2. Map the request to the correct app or package.
3. Explain ownership clearly:
   - `apps/*` are deployable surfaces.
   - `packages/*` hold shared capabilities imported as `@repo/*`.
4. Mention root scripts or Turbo filtering only if they help solve the task.

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

## Answering Guidance

- Distinguish template defaults from repo-specific reality. Say "next-forge defaults to ..." when you are describing the starter, and "this repo currently ..." when you inspected the workspace.
- When debugging env issues, look for package-local `keys.ts`, `.env.local`, and `packages/database/.env` before guessing.
- When recommending provider swaps, mention the minimal surface area to change first: the owning package, any webhook routes, and any provider-specific UI or middleware.
- When the user asks "where does X live?", answer with the most likely app or package first, then verify against the repo.
- Do not duplicate the long package catalog or setup checklist in your response unless the user explicitly wants an overview.

## Reference Map

- `references/setup.md`
  Use for installation, prerequisites, env vars, database bootstrap, Stripe CLI, and local development commands.
- `references/architecture.md`
  Use for app/package layout, Turbo tasks, scripts, filtering, and build outputs.
- `references/packages.md`
  Use for package-by-package responsibilities, exports, webhook endpoints, and provider defaults.
- `references/customization.md`
  Use for swapping providers, adding apps/packages, deployment patterns, theming, and feature extensions.
