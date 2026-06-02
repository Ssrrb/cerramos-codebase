# Cloud Run Deployment Summary - 2026-05-27

## Current Status

The `cerramos` GCP project has been bootstrapped and the three active
next-forge surfaces are deployed to Cloud Run in `us-central1`:

| Service | App | Latest revision | Reported URL |
| --- | --- | --- | --- |
| `cerramos-app` | `apps/app` | `cerramos-app-00002-ghc` | `https://cerramos-app-d7jlfxrsbq-uc.a.run.app` |
| `cerramos-web` | `apps/web` | `cerramos-web-00002-klv` | `https://cerramos-web-d7jlfxrsbq-uc.a.run.app` |
| `cerramos-api` | `apps/api` | `cerramos-api-00002-fw6` | `https://cerramos-api-d7jlfxrsbq-uc.a.run.app` |

The latest Cloud Build completed successfully:

- Build ID: `20f0612e-9725-46ac-8b1e-8a72ab5d4729`
- Status: `SUCCESS`
- Finished at: `2026-05-27T14:05:21.633974Z`

Smoke checks performed:

- `https://cerramos-api-d7jlfxrsbq-uc.a.run.app/health` returned `OK`.
- `https://cerramos-api-622748835636.us-central1.run.app/health` also returned `OK`.

## Repository Changes Made

Deployment packaging and Cloud Run support:

- Added `Dockerfile` for building one Cloud Run image per app with `APP=app|web|api`.
- Added `.dockerignore` to keep build artifacts, env files, local credentials, and dependency folders out of Docker builds.
- Added `.gcloudignore` so `gcloud builds submit` does not upload local secrets or generated artifacts.
- Added `cloudbuild.yaml` to build, push, and deploy `cerramos-app`, `cerramos-web`, and `cerramos-api`.
- Added `docs/cloud-run-deployment.md` with setup and deployment runbook.
- Enabled Next.js standalone output in `packages/next-config/index.ts`.

Fixes needed during deployment:

- Changed `cloudbuild.yaml` image tags from `$SHORT_SHA` to `$BUILD_ID` because manual `gcloud builds submit` does not always provide `SHORT_SHA`.
- Aligned `packages/feature-flags/package.json` peer dependency from `next@16.1.6` to `next@16.2.5`.
- Refreshed `bun.lock` after the peer dependency alignment.
- Simplified `packages/storage/index.ts` credential handling so Cloud Run uses attached service-account identity cleanly and Turbopack standalone tracing does not pull in the whole repo.
- Updated `packages/storage/index.test.ts` for the simplified credential behavior and current lint expectations.

## GCP Resources Created or Configured

Project and region:

- Project: `cerramos`
- Region: `us-central1`
- Active gcloud account used: `sirsebastianrojas@gmail.com`

Enabled APIs:

- `artifactregistry.googleapis.com`
- `cloudbuild.googleapis.com`
- `run.googleapis.com`
- `secretmanager.googleapis.com`
- `iamcredentials.googleapis.com`
- `storage.googleapis.com`

Artifact Registry:

- Repository: `cerramos`
- Location: `us-central1`
- Image paths:
  - `us-central1-docker.pkg.dev/cerramos/cerramos/cerramos-app:$BUILD_ID`
  - `us-central1-docker.pkg.dev/cerramos/cerramos/cerramos-web:$BUILD_ID`
  - `us-central1-docker.pkg.dev/cerramos/cerramos/cerramos-api:$BUILD_ID`

Runtime service account:

- `cerramos-cloud-run@cerramos.iam.gserviceaccount.com`

Secrets:

- `cerramos-database-url`
- `cerramos-better-auth-secret`

Storage:

- Existing bucket used: `gs://imagenes-cerramos`

IAM configured:

- Runtime service account has `roles/storage.objectAdmin` on `gs://imagenes-cerramos`.
- Runtime service account has `roles/iam.serviceAccountTokenCreator` on itself for signed GCS URLs.
- Runtime service account has `roles/secretmanager.secretAccessor` on both deployment secrets.
- Cloud Build default service account is `622748835636-compute@developer.gserviceaccount.com`.
- Cloud Build default service account was granted:
  - `roles/run.admin`
  - `roles/iam.serviceAccountUser`
  - `roles/artifactregistry.writer`

## Build and Deploy Timeline

1. Verified local gcloud config:
   - Project: `cerramos`
   - Account: `sirsebastianrojas@gmail.com`
   - Region was unset, so `us-central1` was used.

2. Found missing GCP bootstrap:
   - Artifact Registry API disabled.
   - Secret Manager API disabled.
   - Runtime service account missing.
   - Bucket `imagenes-cerramos` already existed.

3. Enabled required APIs and created:
   - Artifact Registry repo `cerramos`.
   - Runtime service account `cerramos-cloud-run`.
   - Secret Manager secrets from local `.env.local` values without printing secret contents.

4. Deployed temporary `gcr.io/cloudrun/hello` services to reserve service URLs:
   - `cerramos-app`
   - `cerramos-web`
   - `cerramos-api`

5. Submitted Cloud Build once with image tags using `$SHORT_SHA`.
   - Failed because `$SHORT_SHA` was empty for manual submit, producing an invalid image tag ending in `:`.
   - Fixed by switching tags to `$BUILD_ID`.

6. Submitted Cloud Build again.
   - Failed in `build-app`.
   - Root cause: `packages/feature-flags` peer dependency forced `next@16.1.6` while apps use `next@16.2.5`, creating duplicate `NextRequest` types.
   - Fixed by aligning the peer dependency and refreshing `bun.lock`.

7. Submitted Cloud Build a third time.
   - Build ID: `20f0612e-9725-46ac-8b1e-8a72ab5d4729`
   - Final status: `SUCCESS`
   - All three services deployed revision `00002`.

## Current Runtime Environment

All three deployed services currently have these env values:

- `NODE_ENV=production`
- `HOSTNAME=0.0.0.0`
- `NEXT_TELEMETRY_DISABLED=1`
- `NEXT_PUBLIC_APP_URL=https://cerramos-app-622748835636.us-central1.run.app`
- `NEXT_PUBLIC_WEB_URL=https://cerramos-web-622748835636.us-central1.run.app`
- `NEXT_PUBLIC_API_URL=https://cerramos-api-622748835636.us-central1.run.app`
- `NEXT_PUBLIC_DOCS_URL=https://docs.example.com`
- `BETTER_AUTH_URL=https://cerramos-app-622748835636.us-central1.run.app`
- `GCS_BUCKET_NAME=imagenes-cerramos`
- `GOOGLE_CLOUD_PROJECT=cerramos`
- `DATABASE_URL` from Secret Manager secret `cerramos-database-url:latest`
- `BETTER_AUTH_SECRET` from Secret Manager secret `cerramos-better-auth-secret:latest`

Cloud Run now reports canonical service URLs in the newer `*.a.run.app` form,
while the build/runtime public env values use the initial
`*-622748835636.us-central1.run.app` form. Both API health URLs tested
successfully, but custom domains should replace these values for production.

## Verification Performed

Local verification before deployment:

- `bun run build` passed for `apps/app`, `apps/web`, and `apps/api`.
- `bun run test` passed in `packages/storage`.
- Targeted Biome check passed for changed TypeScript files.
- `cloudbuild.yaml` parsed successfully as YAML.

Cloud verification:

- GCP APIs enabled successfully.
- Artifact Registry repo created successfully.
- Runtime service account created successfully.
- Secrets created successfully.
- IAM grants applied successfully, except two project IAM grants initially hit concurrent policy update conflicts and were retried successfully.
- Final Cloud Build succeeded.
- Cloud Run services show latest ready revisions.
- API `/health` returned `OK`.

Known non-blocking issue:

- Full `bun run check` was already blocked by unrelated lint/format issues across `apps/app`; this was not caused by the deployment work.

## Follow-Ups

Recommended next steps:

- Configure real custom domains for:
  - app, for example `https://app.<domain>`
  - web, for example `https://www.<domain>`
  - api, for example `https://api.<domain>`
- Redeploy with those custom domains in Cloud Build substitutions:
  - `_APP_URL`
  - `_WEB_URL`
  - `_API_URL`
  - optionally `_DOCS_URL`
- Update Google OAuth callback settings if Google auth is enabled.
- Run production database migrations against Neon:

```sh
DATABASE_URL="postgresql://..." bun run migrate:deploy
```

- Add optional provider secrets/env vars as needed:
  - PagoPar
  - Resend
  - Google OAuth
  - PostHog
  - Sentry
  - Better Stack
  - BaseHub
  - Upstash
  - Knock
  - Liveblocks
  - Svix

Useful redeploy command with the current generated URLs:

```sh
gcloud builds submit \
  --config cloudbuild.yaml \
  --project=cerramos \
  --substitutions '_REGION=us-central1,_ARTIFACT_REPOSITORY=cerramos,_SERVICE_ACCOUNT_NAME=cerramos-cloud-run,_APP_URL=https://cerramos-app-d7jlfxrsbq-uc.a.run.app,_WEB_URL=https://cerramos-web-d7jlfxrsbq-uc.a.run.app,_API_URL=https://cerramos-api-d7jlfxrsbq-uc.a.run.app,_GCS_BUCKET_NAME=imagenes-cerramos'
```

