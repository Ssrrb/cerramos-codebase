# web load-time optimization

This program is an experiment loop for improving `apps/web` load time while preserving the repo's next-forge-derived Turborepo standards.

The goal is simple: lower measured page load time of the checkout flow without weakening buyer checkout behavior.

Relevant codebase information:

- `apps/web` is the public surface for marketing, localized public pages, and buyer-facing checkout flows; it does not own merchant operations or standalone webhook/cron infrastructure. See [`README.md`](./README.md).
- The next-forge architecture for this repo keeps deployable apps under `apps/`, shared modules under `packages/`, and shared imports under `@repo/*`. See [`../../skills/next-forge/references/architecture.md`](../../skills/next-forge/references/architecture.md).
- Root commands are Bun/Turbo-based: `bun run dev`, `bun run build`, `bun run test`, `bun run check`, and `bun run fix`. See [`../../package.json`](../../package.json).
- Formatting and linting use Ultracite/Biome presets for React and Next.js. See [`../../biome.jsonc`](../../biome.jsonc).

## Setup

To set up a new optimization session:

1. **Agree on a run tag**: propose a tag based on today's date and scope, for example `may6-web-load`. Use a fresh branch such as `codex/web-loadtime-<tag>`.
2. **Confirm the current state**: run `git status --short` and note any existing user changes before editing. Do not revert unrelated changes.
3. **Read the in-scope files**:
   - [`README.md`](./README.md) for `apps/web` ownership.
   - [`package.json`](./package.json) for app-local commands.
   - [`playwright.config.ts`](./playwright.config.ts) for the Playwright server, base URL, and browser target.
   - [`apps/web/tests/checkout-dynamic-routes.spec.ts`](./apps/web/tests/checkout-dynamic-routes.spec.ts) for the current Playwright navigation/load-time pattern.
   - Target route and component files under [`app/`](./app) and [`components/`](./components) before changing UI or routing.
   - Shared `@repo/*` packages only when the optimization crosses package boundaries.
4. **Initialize the session TSV**: create `load-time-results.tsv` beside this file with only the header row. The baseline run must be the first data row.
5. **Confirm Playwright can measure the page**: run `bun run --cwd apps/web evaluate`. Playwright is already configured to start `bun run dev`, reuse `http://127.0.0.1:3001`, and run Chromium.
6. **Record the baseline**: measure the current load time before making any optimization.

Relevant codebase information:

- `apps/web/package.json` exposes `evaluate` and `evaluate:ui` as Playwright commands.
- `apps/web/playwright.config.ts` sets `baseURL` to `http://127.0.0.1:3001`, starts the app with `bun run dev`, and uses the Desktop Chrome project.
- `apps/web/apps/web/tests/checkout-dynamic-routes.spec.ts` already uses Playwright's `page.goto`, `performance.getEntriesByType("navigation")`, and `loadEventEnd - startTime` pattern. If the test uses a fixed mocked value, do not treat that mocked value as the optimization metric; use the same browser timing API without stubbing for real measurements.

## Experimentation

Each experiment should make one focused optimization and then measure again.

What you can do:

- Modify `apps/web` routes, layouts, components, styles, and tests when the change directly affects public load time.
- Move reusable logic into the smallest appropriate `packages/*` boundary if reuse is real and already aligned with the codebase.
- Use App Router defaults: prefer server components, and add client components only where interactivity is required.
- Optimize images, imports, data loading, metadata, CSS, and route-level rendering work when evidence shows they affect load time.

What you cannot do:

- Do not move public checkout or marketing behavior into `apps/app` or webhook/cron behavior into `apps/web`; preserve app ownership.
- Do not collapse order state and payment state or treat messaging channels as the operational source of truth.
- Do not install new dependencies unless the optimization cannot be done with existing Next.js, React, Bun, Playwright, or `@repo/*` capabilities.
- Do not change Playwright to hide regressions. The measurement path must stay able to report real navigation timing.
- Do not skip `bun run check` after source changes that affect TypeScript, React, styling, or imports.

The load-time measurement should use Playwright because this app already has Playwright installed and configured for `apps/web`. A measurement test or helper should collect the navigation timing in the browser:

```ts
const loadTimeMs = await page.evaluate(() => {
  const [navigation] = performance.getEntriesByType(
    "navigation"
  ) as PerformanceNavigationTiming[];

  if (!navigation) {
    throw new Error("Navigation timing entry was not available.");
  }

  return Math.round(navigation.loadEventEnd - navigation.startTime);
});
```

For each run, measure at least the default public homepage (`/`). When an optimization touches localization, measure every locale route covered by `apps/web/tests/checkout-dynamic-routes.spec.ts`. When it touches checkout, also measure a representative buyer checkout route with stable fixture data.

Relevant codebase information:

- `apps/web` owns localized public pages and buyer-facing checkout flows, so load-time changes should be evaluated against those surfaces.
- The root Turborepo pipeline builds apps with `bun run build` and checks all workspaces with `bun run check`; app-local tests run through `bun run --cwd apps/web test`, and Playwright evaluation runs through `bun run --cwd apps/web evaluate`.
- Shared modules should stay under `packages/*` and be imported through `@repo/*`, matching the next-forge architecture.

## Output format

For every measured run, capture the important output in the terminal log and append a TSV row.

Playwright output should include a machine-readable line per measured route:

```text
LOAD_TIME_MS	/	1234
```

If multiple routes are measured, each route can be logged separately, then summarized in the TSV with the primary route or median route value. Keep the raw Playwright log until the TSV row is appended.

When a run crashes or never reaches navigation timing, use `0` for `load_time_ms`, mark the status as `crash`, and include the failure class in the description.

Relevant codebase information:

- `apps/web/playwright.config.ts` enables traces on first retry, which can help debug failed measurement runs.
- `apps/web/package.json` keeps Playwright under the app's own scripts, so use `bun run --cwd apps/web evaluate` instead of inventing a root-level command.

## Logging results

Log results to `load-time-results.tsv` as tab-separated values, not comma-separated values. Leave the TSV untracked unless the user explicitly asks to commit experiment logs.

The TSV has one header row and these columns:

```text
timestamp	session	branch	commit	route	load_time_ms	delta_ms	status	optimization	files_changed	notes
```

Column rules:

- `timestamp`: ISO-8601 timestamp for when the run completed.
- `session`: the agreed run tag.
- `branch`: current branch name.
- `commit`: short git commit hash for the measured source state, or `uncommitted` if the run is intentionally measured before commit.
- `route`: measured route, for example `/`, `/en`, or a checkout route.
- `load_time_ms`: measured `loadEventEnd - startTime` in milliseconds.
- `delta_ms`: difference from the current best baseline for the same route. Negative is better.
- `status`: `baseline`, `keep`, `discard`, or `crash`.
- `optimization`: short description of the change tried.
- `files_changed`: semicolon-separated file list; avoid commas.
- `notes`: short context such as `homepage only`, `all locales`, `checkout fixture`, or the crash reason.

Example:

```text
timestamp	session	branch	commit	route	load_time_ms	delta_ms	status	optimization	files_changed	notes
2026-05-06T14:00:00-04:00	may6-web-load	codex/web-loadtime-may6	a1b2c3d	/	1432	0	baseline	unchanged source	none	first measurement
2026-05-06T14:18:00-04:00	may6-web-load	codex/web-loadtime-may6	b2c3d4e	/	1198	-234	keep	defer noncritical hero media	app/[locale]/(marketing)/(home)/components/hero.tsx	homepage improved
2026-05-06T14:32:00-04:00	may6-web-load	codex/web-loadtime-may6	uncommitted	/	1510	312	discard	add extra client animation	app/[locale]/(marketing)/(home)/components/hero.tsx	slower and more client JS
2026-05-06T14:45:00-04:00	may6-web-load	codex/web-loadtime-may6	uncommitted	/	0	0	crash	change image loader	app/[locale]/(marketing)/(home)/components/hero.tsx	build failed
```

Relevant codebase information:

- The repo uses concise, scoped commits, but local experiment TSV files are session artifacts, not product source.
- Product docs require docs updates when ownership boundaries or canonical architecture direction changes; routine load-time experiments usually only update local docs when the process changes.

## The experiment loop

Run this loop until the user stops the session:

1. Check `git status --short`, the current branch, and the current best TSV row for the route being optimized.
2. Pick one optimization idea and write down the expected mechanism before editing.
3. Edit the smallest relevant surface. Stay inside `apps/web` unless a shared package is the correct owner.
4. Run the relevant validation:
   - `bun run --cwd apps/web evaluate` for Playwright load-time measurement.
   - `bun run --cwd apps/web test` when app behavior or helpers changed.
   - `bun run check` before keeping source changes.
   - `bun run build --filter web` when the optimization affects rendering, imports, Next.js config, or production-only behavior.
5. Extract `LOAD_TIME_MS` rows from the Playwright log and append one TSV row per route or summary route.
6. Compare against the current best route value.
7. If load time improves and validation passes, keep the source change and optionally commit it with a concise lower-case subject.
8. If load time is equal or worse, revert only your own experimental changes and log `discard`.
9. If the run crashes, inspect the Playwright output and trace. Fix simple mistakes and rerun; otherwise revert your own experimental changes and log `crash`
10. Repeat from the best experiment base.

Relevant codebase information:

- Root scripts in `package.json` and Turbo filters are the source of truth for build, test, check, and app-scoped runs.
- `turbo.json` marks `dev` as persistent and uncached, while `build` depends on upstream builds and tests. Use app filters when the workspace-wide command is unnecessary.
- The product architecture favors clear domain ownership over broad rewrites, so optimize incrementally and preserve public/operational boundaries.

**Timeout**: If a single Playwright measurement or production build hangs beyond a reasonable local threshold, stop that run, log `crash` or `discard`, and include the command that stalled in the TSV notes.

**Crashes**: If a crash is caused by a typo, missing import, or test fixture issue, fix it and rerun. If the optimization idea itself breaks rendering, routing, localization, or checkout semantics, revert your own changes and move on.
