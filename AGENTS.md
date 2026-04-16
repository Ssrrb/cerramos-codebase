# Repository Guidelines

## Project Structure & Module Organization
This repository is a Bun-powered Turborepo. Deployable apps live in `apps/`, shared modules in `packages/`, product docs in `docs/content/docs/product/`, and repo automation in `scripts/` and `turbo/`.

- `apps/app`: authenticated product surface
- `apps/web`: public marketing site
- `apps/api`: API routes, webhooks, health checks
- `apps/storybook`: isolated UI development
- `packages/*`: shared `@repo/*` modules such as `auth`, `database`, `design-system`, and `payments`

Read the product docs before large structural changes; this repo is still being reshaped from the `next-forge` starter into Cheki-specific modules.

## Build, Test, and Development Commands
Run commands from the repository root:

- `bun run dev`: start all active dev targets through Turbo
- `bun run build`: build the workspace
- `bun run test`: run all package and app tests
- `bun run check`: run the Ultracite/Biome checks
- `bun run fix`: apply automated formatting and lint fixes
- `bun run migrate`: generate and apply Drizzle migrations
- `bun run db:studio`: open the database studio for `packages/database`

Scope work when needed, for example `bun run dev --filter app` or `bun run build --filter @repo/database`.

## Coding Style & Naming Conventions
TypeScript and ESM are the default. Formatting and linting are enforced through `biome.jsonc` with Ultracite presets.

- Use Biome formatting rather than manual style tweaks
- Use `PascalCase` for React components, `camelCase` for functions, and `kebab-case` for route segments and non-component file names
- Keep shared logic in the smallest appropriate `packages/*` boundary instead of duplicating it across apps

## Testing Guidelines
Vitest is the active test runner. Tests live both as colocated `*.test.ts` files and in app-level `__tests__/` directories such as `apps/api/__tests__/health.test.ts`.

- Run all tests with `bun run test`
- Run a single workspace with Turbo filters or the package script, for example `bun run --cwd packages/auth test`
- Add or update tests for auth, API, database, and critical UI behavior changes

## Commit & Pull Request Guidelines
Recent commits use short, lower-case subjects like `skills moved` and `migration from prisma to drizzle`. Keep commit messages concise and scoped to one change.

PRs should include a clear summary, linked issue or product context, test notes, and screenshots for UI changes. Call out migrations, env changes, and cross-boundary changes.

## Contributor Notes
Prefer incremental refactors over broad rewrites. Do not collapse order state and payment state into one model, and do not treat messaging channels as the source of truth; internal product surfaces own operational state.
