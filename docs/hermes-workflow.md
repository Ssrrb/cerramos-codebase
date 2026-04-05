# Hermes workflow for cerramos-codebase

This repo now includes a Hermes-friendly review and devops setup tailored to the current Cerramos workstream.

## Current branch focus

The active branch `03-Product-Link-URL` is changing:

- merchant product management in `apps/app`
- public product-link checkout in `apps/web`
- supporting schema and migration logic in `packages/database`
- shared checkout and auth UI in `packages/design-system`

That means PR review and deploy checks should prioritize the product-link path end to end instead of running an unfocused generic monorepo checklist.

## New helper commands

From the repo root:

```bash
bun run hermes:pr-review
bun run hermes:devops
bun run hermes:devops -- origin/main full
```

### `bun run hermes:pr-review`

Runs a focused pre-PR review against `origin/main` by default.

What it does:

- prints the changed files and diff stats
- checks git diff hygiene
- runs app tests and typecheck when merchant-side or shared dependencies changed
- runs web tests and typecheck when checkout or shared dependencies changed
- runs database checks when migrations or API/database layers changed
- prints a repo-specific review checklist for Cerramos

### `bun run hermes:devops`

Runs a broader release gate for the same branch.

What it does:

- runs repo diff hygiene checks
- runs app, web, and database tests
- runs app, web, and database typechecks
- optionally runs app/web builds in `full` mode
- warns when migration files changed

## GitHub Actions PR gate

A new workflow lives at `.github/workflows/pr-quality.yml`.

It is path-aware and only runs the jobs that matter for the changed areas:

- `app-quality`
- `web-quality`
- `database-quality`

The workflow is tuned for the current product-link stream, where a change in `packages/database` or `packages/design-system` can affect both merchant and checkout surfaces.

## Suggested Hermes prompts

Use prompts like these with Hermes:

- `Review my PR in ~/Desktop/cerramos-codebase against origin/main and focus on product-link, checkout, and migration risks.`
- `Run the cerramos devops gate in full mode and tell me what is blocking merge.`
- `Inspect the diff on 03-Product-Link-URL and look for merchant-vs-checkout state drift.`
- `Review database and webhook impact for this branch before deploy.`

## Review priorities for Cerramos

When Hermes reviews this repo, it should especially check:

1. order status vs payment status remain separate
2. merchant app stays the operational source of truth
3. public checkout only exposes active, valid product links
4. trust-state restrictions for payment-required flows stay enforced
5. migrations, snapshots, and runtime access patterns remain aligned

## Current status

During setup, the focused checks showed one app test issue caused by a Vitest mock that no longer exported `isMissingRelationError`. That mock was updated so the app review path matches the current `@repo/database` API.
