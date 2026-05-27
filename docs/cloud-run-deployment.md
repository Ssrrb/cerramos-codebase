# Cloud Run deployment

This repo deploys the three active Next.js surfaces as separate Cloud Run
services:

- `cerramos-app` for `apps/app`
- `cerramos-web` for `apps/web`
- `cerramos-api` for `apps/api`

The deployment keeps PostgreSQL on Neon and uses Google Cloud Storage through
the Cloud Run runtime service account. Do not set
`GOOGLE_APPLICATION_CREDENTIALS` in Cloud Run.

## One-time GCP setup

Set these shell values before running the commands:

```sh
PROJECT_ID="your-gcp-project"
REGION="us-central1"
ARTIFACT_REPOSITORY="cerramos"
SERVICE_ACCOUNT_NAME="cerramos-cloud-run"
GCS_BUCKET_NAME="cerramos-assets"
```

Enable the required APIs:

```sh
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com \
  storage.googleapis.com \
  --project "$PROJECT_ID"
```

Create the Artifact Registry repository:

```sh
gcloud artifacts repositories create "$ARTIFACT_REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --project "$PROJECT_ID"
```

Create the runtime service account and grant storage access:

```sh
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
  --project "$PROJECT_ID"

RUNTIME_SA="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET_NAME" \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project "$PROJECT_ID"
```

Create the required secrets:

```sh
printf '%s' "$DATABASE_URL" | gcloud secrets create cerramos-database-url \
  --data-file=- \
  --project "$PROJECT_ID"

openssl rand -base64 48 | gcloud secrets create cerramos-better-auth-secret \
  --data-file=- \
  --project "$PROJECT_ID"
```

Allow the runtime service account to read the secrets mounted into Cloud Run:

```sh
gcloud secrets add-iam-policy-binding cerramos-database-url \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"

gcloud secrets add-iam-policy-binding cerramos-better-auth-secret \
  --member="serviceAccount:$RUNTIME_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"
```

Allow the Cloud Build service account to deploy Cloud Run, attach the runtime
service account, push images, and reference the deployment secrets:

```sh
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
CLOUD_BUILD_SA="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/artifactregistry.writer"

gcloud secrets add-iam-policy-binding cerramos-database-url \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"

gcloud secrets add-iam-policy-binding cerramos-better-auth-secret \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"
```

## Deploy

Replace the URL substitutions with either custom domains or the final Cloud Run
URLs once they are known:

```sh
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "$PROJECT_ID" \
  --substitutions "_REGION=$REGION,_ARTIFACT_REPOSITORY=$ARTIFACT_REPOSITORY,_SERVICE_ACCOUNT_NAME=$SERVICE_ACCOUNT_NAME,_APP_URL=https://app.example.com,_WEB_URL=https://www.example.com,_API_URL=https://api.example.com,_GCS_BUCKET_NAME=$GCS_BUCKET_NAME"
```

Before routing real traffic, run production migrations against Neon:

```sh
DATABASE_URL="postgresql://..." bun run migrate:deploy
```

## Required runtime environment

Cloud Build sets these for all three services:

- `DATABASE_URL` from Secret Manager
- `BETTER_AUTH_SECRET` from Secret Manager
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WEB_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_DOCS_URL`
- `GCS_BUCKET_NAME`
- `GOOGLE_CLOUD_PROJECT`

Optional provider variables, such as PagoPar, Resend, Google OAuth, PostHog,
Sentry, Better Stack, BaseHub, Upstash, Knock, Liveblocks, and Svix can be added
later with `gcloud run services update`.

## Smoke checks

After deployment:

```sh
curl -fsS "https://api.example.com/health"
```

The expected response is `OK`.
