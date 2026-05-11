# web landing page

This program is an experiment loop for improving `apps/web/marketing` by adding relevant Cheki pictures, screenshots, copy, and contextual information to the public landing page.

The goal is simple: put the right Cheki information in the site, using relevant screenshots and supporting context in each section, without modifying the repo’s next-forge-derived Turborepo standards or changing ownership boundaries. Only do it in three languages spanish, english, and portuguese.

Relevant codebase information:

- `apps/web` is the public surface for marketing, localized public pages, and buyer-facing checkout flows; it does not own merchant operations or standalone webhook/cron infrastructure. See [`README.md`](./README.md).
- The next-forge architecture for this repo keeps deployable apps under `apps/`, shared modules under `packages/`, and shared imports under `@repo/*`. See [`../../skills/next-forge/references/architecture.md`](../../skills/next-forge/references/architecture.md).
- Root commands are Bun/Turbo-based: `bun run dev`, `bun run build`, `bun run test`, `bun run check`, and `bun run fix`. See [`../../package.json`](../../package.json).
- Formatting and linting use Ultracite/Biome presets for React and Next.js. See [`../../biome.jsonc`](../../biome.jsonc).


## Relevant codebase information

- `apps/web` is the public surface for marketing, localized public pages, and buyer-facing checkout flows; it does not own merchant operations or standalone webhook/cron infrastructure. See [`README.md`](./README.md).
- The marketing landing page work should stay inside `apps/web` unless a shared UI, utility, or asset pattern already belongs in `packages/*`.
- The next-forge architecture for this repo keeps deployable apps under `apps/`, shared modules under `packages/`, and shared imports under `@repo/*`. See [`../../skills/next-forge/references/architecture.md`](../../skills/next-forge/references/architecture.md).
- Root commands are Bun/Turbo-based: `bun run dev`, `bun run build`, `bun run test`, `bun run check`, and `bun run fix`. See [`../../package.json`](../../package.json).
- Formatting and linting use Ultracite/Biome presets for React and Next.js. See [`../../biome.jsonc`](../../biome.jsonc).

## Setup

To set up a new landing page improvement session:

1. **Agree on a run tag**: propose a tag based on today's date and scope, for example `may6-web-landing-cheki`. Use a fresh branch such as `codex/web-landing-<tag>`.
2. **Confirm the current state**: run `git status --short` and note any existing user changes before editing. Do not revert unrelated changes.
3. **Read the in-scope files**:
   - [`README.md`](./README.md) for `apps/web` ownership.
   - [`package.json`](./package.json) for app-local commands.
   - Target route files under [`app/`](./app), especially marketing or localized public page routes.
   - Target component files under [`components/`](./components), especially homepage, hero, feature, social proof, pricing, FAQ, CTA, and shared marketing sections.
   - Existing image, asset, metadata, and localization patterns before adding screenshots or copy.
   - Shared `@repo/*` packages only when the landing page change crosses package boundaries.
4. **Collect Cheki source context**: identify the relevant Cheki product information, screenshots, positioning, target users, benefits, and any existing copy or assets provided by the user or already present in the repo.
5. **Map content to page sections**: determine which landing page sections need Cheki-specific context, screenshots, or supporting details.
6. **Establish a visual baseline**: run the app locally and inspect the current landing page before making changes.
7. **Record baseline notes**: create `landing-page-results.tsv` beside this file with only the header row. The baseline review must be the first data row.

Relevant codebase information:

- `apps/web` owns public marketing pages and localized public pages, so Cheki landing page content should be implemented there.
- Root scripts and app-local scripts are the source of truth for running, checking, testing, and building the app.
- Shared modules should stay under `packages/*` and be imported through `@repo/*`, matching the next-forge architecture.
- Do not create new architectural patterns for one landing page unless existing patterns cannot support the work.

## Experimentation

Each experiment should make one focused landing page improvement and then validate it.

What you can do:

- Modify `apps/web` marketing routes, layouts, components, styles, copy, metadata, and tests when the change directly affects the public landing page.
- Add relevant Cheki screenshots, product images, UI visuals, diagrams, or contextual assets using the existing asset conventions.
- Improve section-level context, including hero copy, product explanation, benefits, workflows, use cases, social proof, FAQs, and calls to action.
- Use App Router defaults: prefer server components, and add client components only where interactivity is required.
- Improve responsive layout, accessibility, metadata, image alt text, and localization readiness.
- Move reusable logic into the smallest appropriate `packages/*` boundary only if reuse is real and already aligned with the codebase.

What you cannot do:

- Do not move public marketing behavior into `apps/app` or merchant operations into `apps/web`; preserve app ownership.
- Do not introduce webhook, cron, admin, merchant dashboard, or operational behavior into the marketing app.
- Do not install new dependencies unless the landing page improvement cannot be done with existing Next.js, React, Bun, or `@repo/*` capabilities.
- Do not replace next-forge-derived conventions, routing structure, workspace imports, linting rules, or Turborepo standards.
- Do not hard-code misleading product claims, fake metrics, fake testimonials, or unsupported Cheki functionality.
- Do not add large unoptimized media assets without using the repo’s existing image optimization approach.
- Do not skip `bun run check` after source changes that affect TypeScript, React, styling, imports, or metadata.

Each experiment should have a clear content goal, for example:

- Add Cheki-specific hero copy and product screenshot.
- Replace generic feature cards with Cheki use cases.
- Add a workflow section showing how Cheki works.
- Add screenshots to explain the buyer or merchant experience.
- Improve CTA clarity.
- Add FAQ content based on real Cheki context.
- Improve metadata and social sharing content.
- Improve mobile layout for screenshot-heavy sections.

For every visual or content addition, confirm:

- The image is relevant to the section.
- The copy is specific to Cheki.
- The section explains what the user can do or why it matters.
- The page still follows existing component, routing, and styling conventions.
- The change does not create unnecessary client-side JavaScript.

Relevant codebase information:

- `apps/web` owns localized public pages and buyer-facing checkout flows, so landing page changes should not break those surfaces.
- The root Turborepo pipeline builds apps with `bun run build` and checks all workspaces with `bun run check`.
- App-local tests run through `bun run --cwd apps/web test` when relevant.
- Shared modules should stay under `packages/*` and be imported through `@repo/*`, matching the next-forge architecture.

## Output format

For every reviewed run, capture the important terminal output and append a TSV row.

If using screenshots for review, keep them as local session artifacts unless the user explicitly asks to commit them. Product screenshots used by the actual landing page may be committed only if they are part of the intended source change and follow existing repo conventions.

When a run crashes or the page cannot render, use `crash` as the status and include the failure class in the description.

## Logging results

Log results to `landing-page-results.tsv` as tab-separated values, not comma-separated values. Leave the TSV untracked unless the user explicitly asks to commit experiment logs.

The TSV has one header row and these columns:


timestamp	session	branch	commit	route	status	change	sections_changed	files_changed	validation	notes


## The experiment loop

Run this loop until the user stops the session:

1. Check git status --short, the current branch, and the current best TSV row for the route being improved.
2. Pick one focused landing page improvement and write down the expected content or UX mechanism before editing.
3. Edit the smallest relevant surface. Stay inside apps/web unless a shared package is the correct owner.
4. Add or update screenshots, images, alt text, metadata, and copy only where they improve Cheki-specific context.
5. Run the relevant validation:
    * bun run dev or the app-local dev command to inspect the landing page.
    * bun run check after source changes that affect TypeScript, React, styling, imports, or metadata.
    * bun run --cwd apps/web test when app behavior, helpers, routing, or tests changed.
    * bun run build --filter web when the change affects rendering, imports, Next.js config, images, metadata, or production-only behavior.
6. Review the changed route visually, including desktop and mobile layouts when the section includes images or screenshots.
7. Append one TSV row per reviewed route or summary route.
8. Compare against the current best version for clarity, relevance, correctness, responsiveness, and architectural fit.
9. If the page is clearer, Cheki-specific, visually sound, and validation passes, keep the source change and optionally commit it with a concise lower-case subject.
10. If the change is confusing, generic, visually worse, unsupported by Cheki facts, or adds unnecessary complexity, revert only your own experimental changes and log discard.
11. If the run crashes, inspect the terminal output. Fix simple mistakes and rerun; otherwise revert your own experimental changes and log crash.
12. Repeat from the best experiment base.