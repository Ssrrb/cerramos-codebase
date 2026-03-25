# Unauthenticated Entry Flow

`apps/app/app/(unauthenticated)` contains the public auth entry points for the
Cerramos dashboard app.

These routes exist to get commercial users into the product safely and then hand
them off to the authenticated dashboard in `apps/app/app/(authenticated)`.

## What This Area Covers

- sign in
- sign up
- auth chrome and legal links
- post-auth redirection into onboarding or the dashboard

## Hard Part: This App Is Not the Marketing Site

`apps/app/app` is the Cerramos **merchant dashboard**, not the public website.
Commercial users use it to:

- see business stats and operational activity
- manage products and clients
- create payment links associated with products

Because of that, successful authentication is only part of the job. We also need
to make sure the signed-in user is attached to a commerce before they can use the
dashboard.

## Hard Part: After Sign-up or Google Login

There are two steps in the happy path:

1. authenticate the person
2. ensure that person belongs to a commerce

Email sign-up handles both:

1. the user account is created
2. the UI calls `/api/auth/bootstrap`
3. the bootstrap route creates the commerce and attaches it to the new user
4. the user is redirected into the dashboard

Google sign-up/sign-in can authenticate the user before a commerce exists. In
that case, the authenticated layout will detect the missing `commerceId` and send
the user to `/onboarding`, where they finish creating their commerce before
entering the dashboard.

## Hard Part: Return Paths

Sign-in and sign-up both accept a `returnTo` query param. That value is sanitized
before use so we only redirect to safe internal paths. This lets auth screens send
users back to the dashboard page they originally wanted without allowing unsafe
external redirects.
