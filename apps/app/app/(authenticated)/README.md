# Authenticated Dashboard

`apps/app/app/(authenticated)` is the internal dashboard for Cerramos commercial users.
This is where merchants and operators land after authentication to:

- review store stats and operational activity
- manage clients, products, and payments
- create and manage payment links tied to the products they sell

## Route Group Responsibility

Everything in this route group assumes the user already has:

- a valid authenticated session
- an associated `commerceId`

That assumption is enforced in [`layout.tsx`](./layout.tsx) through
`requireCommerceContext()`. If a user is signed in but still does not belong to a
commerce, they are redirected to `/onboarding` before any dashboard page renders.

## Hard Part: Commerce Context

The dashboard is not just "signed in vs signed out". It also depends on an
**active commerce context**:

- the authenticated user must exist
- the user must be attached to a commerce
- the commerce record is used to populate the sidebar, navbar, and app shell

`requireCommerceContext()` resolves that server-side and gives pages/layouts the
current commerce and user metadata needed to render a merchant-facing workspace.

## Hard Part: Onboarding After Sign-up

The first dashboard experience depends on whether the user already has a
commerce:

1. A user signs up with email/password or Google.
2. If the account does not yet have a `commerceId`, the user is sent through the
   onboarding/bootstrap flow.
3. The onboarding step creates the commerce record and attaches the signed-in
   user as `merchant_admin`.
4. Only then can the authenticated dashboard render.

This matters because the dashboard data model is commerce-scoped. Stats,
products, clients, orders, payments, and payment links all belong to a merchant
workspace, not to a free-floating user session.

## Notes

- `page.tsx` is the dashboard home surface for high-level stats/widgets.
- `clientes/`, `productos/`, and `pagos/` provide the first merchant-facing
  management views.
- Shared shell UI lives in `apps/app/app/components/` and is wired here by the
  authenticated layout.
