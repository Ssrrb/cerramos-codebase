# Cerramos Component Workflow

## Ownership

- `packages/design-system/components`: reusable UI and field components
- `apps/storybook/stories`: visual coverage for shared components
- `apps/app`: page composition, data loading, submit flow
- app or shared domain module: interface schemas, payload mappers, labels, and options

## Step-by-step process

1. Inspect the current target route, existing implementation, schema, and API route.
2. Write a compact atomic breakdown of the interface:
   - inputs
   - choices
   - upload states
   - validation states
   - submit/cancel actions
3. Identify what belongs in the shared layer versus the page layer.
4. Build the smallest reusable field components first.
5. If multiple fields always travel together, create one composed shared section.
6. Add Storybook stories:
   - one story per new shared field
   - one happy-path composed story
7. Update the schema and API contract before the page submission code if the requested interface changes persisted shape.
8. Compose the page using only the shared components plus page-specific layout and data wiring.
9. Test:
   - field validation
   - empty and error states
   - submit success
   - route validation

## Quality bar

- Avoid app-local UI duplicates when the component can live in the design system.
- Keep error messages attached to the field that failed.
- Prefer precise, restrained styling over decorative wrappers.
- Make empty states teach the next action.
- Keep the page component thin and move visual logic into shared components.
