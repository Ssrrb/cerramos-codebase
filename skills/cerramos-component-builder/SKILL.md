---
name: cerramos-component-builder
description: Build Cerramos interface work through a repeatable shared-component workflow. Use when Codex needs to turn a requested page, form, sheet, modal, dashboard section, or UI feature into reusable design-system components under `packages/design-system/components`, Storybook coverage in `apps/storybook`, and final page composition in `apps/app` while keeping app schemas and API contracts aligned with the interface.
---

# Cerramos Component Builder

Inspect the existing repo before designing. Treat `packages/design-system` as the source of truth for reusable UI, `apps/storybook` as the component workshop, and `apps/app` as the page-composition layer.

Load [workflow.md](references/workflow.md) before planning or implementing. Use it as the default operating sequence.

## Default Workflow

1. Inspect the target surface, current schema, API route, and any existing app-local implementation.
2. Break the interface into atomic UI elements before proposing any code:
   - field shell
   - control
   - label
   - description
   - validation/error state
   - empty state
   - async/loading state
   - footer actions
3. Decide the 3-layer delivery shape:
   - shared primitive or field component in `packages/design-system/components`
   - composed shared section when multiple fields belong together
   - page integration in `apps/app`
4. Build the shared components first. Prefer existing `components/ui/*` primitives over new primitives.
5. Add or update Storybook stories for every new shared component and at least one composed happy-path story.
6. Review or update the page-level Zod schema and API route before wiring submission so the UI contract matches persisted data.
7. Keep the app layer thin: data loading, form wiring, submission, server error mapping, and navigation refresh only.

## Repo Rules

- Reuse the current workspace boundaries from `next-forge`: deployable surfaces in `apps/*`, shared modules in `packages/*`.
- Prefer incremental refactors over parallel systems. If an app-local component already exists, replace or shrink it rather than duplicating it.
- Preserve App Router conventions: server components by default, client components only where interactivity is required.
- Match the existing design language unless the request explicitly asks for a new direction.

## Component Intake Template

Capture these inputs before implementation:

- interface goal
- target surface and route
- fields and control types
- validation rules
- data source dependencies
- async states
- visual states
- acceptance criteria

## Deliverable Checklist

- shared components added or updated in `packages/design-system/components`
- Storybook stories for each new shared component
- one composed story for the integrated section or form
- page integration in `apps/app`
- schema/API alignment notes or code changes
- tests for validation, page behavior, and route behavior when the work changes user-visible flows
