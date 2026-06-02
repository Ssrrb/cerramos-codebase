# Fix Google Sign-In on GCP Cloud Run (apps/app + apps/web)

> **For Hermes:** Present this plan to the user for review, then craft a single unified prompt for Codex CLI.

**Goal:** Fix Google OAuth sign-in on both `cerramos-app` and `cerramos-web` Cloud Run services.

**Root Causes Found (3):**

| # | Issue | Impact |
|---|-------|--------|
| 1 | `cerramos-web` has `BETTER_AUTH_URL` pointing to `cerramos-app` | Google redirects OAuth callback to the wrong service — session cookie set on wrong domain |
| 2 | `AUTH_GOOGLE_CLIENT_ID` and `AUTH_GOOGLE_CLIENT_SECRET` missing from BOTH Cloud Run services | `isGoogleAuthEnabled()` returns false → `socialProviders` is `{}` → Google sign-in silently disabled in production |
| 3 | Google Cloud Console likely missing web callback URI | Even with fixes 1+2, Google will reject unrecognized redirect_uri |

**Architecture:** Cloud Run services managed via `gcloud` CLI. Google OAuth credentials stored in `.env.local`. Need to create Secret Manager secrets and update Cloud Run service configs.

**Tech Stack:** gcloud CLI, Google Cloud Run, Google Secret Manager, Better Auth (packages/auth)

---

## What Already Exists

| Area | Detail |
|------|--------|
| **Auth server** | `packages/auth/server.ts` — `betterAuthServer` uses `AUTH_GOOGLE_CLIENT_ID`/`AUTH_GOOGLE_CLIENT_SECRET` for `socialProviders.google`. Line 101: `authKeys.AUTH_GOOGLE_CLIENT_ID && authKeys.AUTH_GOOGLE_CLIENT_SECRET ? { google: {...} } : {}` |
| **Auth keys** | `packages/auth/keys.ts` — validates env vars, `isGoogleAuthEnabled()` checks both ID and secret are present |
| **Google creds** | Both `.env.local` files have the same `AUTH_GOOGLE_CLIENT_ID` and `AUTH_GOOGLE_CLIENT_SECRET` values |
| **Cloud Run services** | `cerramos-app` (correct BETTER_AUTH_URL), `cerramos-web` (BETTER_AUTH_URL wrong), `cerramos-api` |
| **Existing secrets** | `cerramos-database-url`, `cerramos-better-auth-secret` — pattern established |
| **GCP project** | `cerramos`, account `sirsebastianrojas@gmail.com` |

---

## Tasks

### Task 1: Create Secret Manager secrets for Google OAuth credentials

**Objective:** Store Google client ID and secret in Secret Manager (reuse existing pattern from `cerramos-better-auth-secret`).

**Commands:**
```bash
# Read the values from apps/app/.env.local
GOOGLE_CLIENT_ID=$(grep AUTH_GOOGLE_CLIENT_ID apps/app/.env.local | cut -d'"' -f2)
GOOGLE_CLIENT_SECRET=$(grep AUTH_GOOGLE_CLIENT_SECRET apps/app/.env.local | cut -d'"' -f2)

# Create secrets
echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create cerramos-google-client-id \
  --data-file=- --replication-policy=automatic
echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create cerramos-google-client-secret \
  --data-file=- --replication-policy=automatic
```

### Task 2: Update cerramos-app Cloud Run service — add Google OAuth env vars

**Objective:** Add `AUTH_GOOGLE_CLIENT_ID` and `AUTH_GOOGLE_CLIENT_SECRET` to cerramos-app (BETTER_AUTH_URL already correct).

**Command:**
```bash
gcloud run services update cerramos-app --region=us-central1 \
  --update-secrets=AUTH_GOOGLE_CLIENT_ID=cerramos-google-client-id:latest \
  --update-secrets=AUTH_GOOGLE_CLIENT_SECRET=cerramos-google-client-secret:latest
```

### Task 3: Update cerramos-web Cloud Run service — fix BETTER_AUTH_URL + add Google OAuth

**Objective:** Fix `BETTER_AUTH_URL` to point to cerramos-web AND add Google OAuth env vars.

**Command:**
```bash
gcloud run services update cerramos-web --region=us-central1 \
  --update-env-vars=BETTER_AUTH_URL=https://cerramos-web-622748835636.us-central1.run.app \
  --update-secrets=AUTH_GOOGLE_CLIENT_ID=cerramos-google-client-id:latest \
  --update-secrets=AUTH_GOOGLE_CLIENT_SECRET=cerramos-google-client-secret:latest
```

### Task 4: Verify Cloud Run configurations

**Objective:** Confirm both services have correct values.

**Commands:**
```bash
gcloud run services describe cerramos-app --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)"
gcloud run services describe cerramos-web --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)"
```

### Task 5: Report Google Cloud Console action items

**Objective:** List the callback URIs that must be registered in Google Cloud Console.

**Required URIs for OAuth 2.0 Client ID `622748...com`:**
```
https://cerramos-app-622748835636.us-central1.run.app/api/auth/callback/google
https://cerramos-web-622748835636.us-central1.run.app/api/auth/callback/google
```

Also note: if using the `.a.run.app` serving URLs, register those too:
```
https://cerramos-app-d7jlfxrsbq-uc.a.run.app/api/auth/callback/google
https://cerramos-web-d7jlfxrsbq-uc.a.run.app/api/auth/callback/google
```

---

## Key Constraints

1. **Both apps share the same Google OAuth client** — same `AUTH_GOOGLE_CLIENT_ID`/`AUTH_GOOGLE_CLIENT_SECRET`. This is fine as long as both callback URIs are registered in Cloud Console.
2. **Cross-app sessions on run.app domains are not possible** — Google's `.run.app` is a public suffix, so setting `BETTER_AUTH_COOKIE_DOMAIN=.us-central1.run.app` won't work. Users must sign in separately on each app.
3. **Do NOT use `--update-env-vars` for secrets** — always use `--update-secrets` to reference Secret Manager. Plain env vars for secrets are visible in the Cloud Console.
4. **Existing secret format** — secrets use key `latest`, not numeric versions.
