# Merchant App

`apps/app` is the merchant product surface: auth entry, onboarding, and authenticated operations.

Owns dashboard pages, merchant workflows, and app-owned routes tightly coupled to this surface.
Does not own public marketing or checkout (`apps/web`), API-only routes (`apps/api`), or shared infrastructure from `packages/*`.

Read `docs/content/docs/product/architecture.mdx` before moving responsibilities across app and package boundaries.
If logic becomes reusable across surfaces, move the reusable part into the owning package.
