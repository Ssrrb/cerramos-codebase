# Public Web

`apps/web` is the public surface for marketing, localized public pages, and buyer-facing checkout flows.

Owns public layouts, buyer entry flows, and web-only route handlers.
Does not own merchant operations (`apps/app`) or standalone webhook and cron infrastructure (`apps/api`).

Reuse shared CMS, i18n, SEO, storage, and database capabilities from `packages/*`.
Keep buyer-facing flow logic separate from merchant operational truth.
