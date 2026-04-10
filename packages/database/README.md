# Database Package

`packages/database` owns the shared database layer: schema, client wiring, migrations, and database scripts.

Changes here have cross-repo impact.
Keep app-specific orchestration out of this package unless it is genuinely shared.

Preserve the separation between order state and payment state.
Update product or architecture docs in the same PR when data ownership changes.
