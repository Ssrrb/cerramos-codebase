# syntax=docker/dockerfile:1

FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /repo

RUN apk add --no-cache libc6-compat

ARG APP
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_WEB_URL=http://localhost:3001
ARG NEXT_PUBLIC_API_URL=http://localhost:3002
ARG NEXT_PUBLIC_DOCS_URL=https://docs.example.com
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG BETTER_AUTH_SECRET=build_time_secret_change_before_runtime_123456
ARG BETTER_AUTH_URL=http://localhost:3000
ARG GCS_BUCKET_NAME=build-placeholder
ARG GOOGLE_CLOUD_PROJECT=build-placeholder

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_WEB_URL=${NEXT_PUBLIC_WEB_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL} \
    DATABASE_URL=${DATABASE_URL} \
    BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} \
    BETTER_AUTH_URL=${BETTER_AUTH_URL} \
    GCS_BUCKET_NAME=${GCS_BUCKET_NAME} \
    GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}

COPY . .

RUN case "$APP" in app|web|api) ;; *) echo "APP must be one of: app, web, api" >&2; exit 1 ;; esac
RUN bun install --frozen-lockfile
RUN mkdir -p apps/app/public apps/api/public apps/web/public
RUN cd apps/${APP} && bun run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

ARG APP

ENV APP=${APP} \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/public ./apps/${APP}/public

USER nextjs

EXPOSE 8080

CMD ["sh", "-c", "node apps/${APP}/server.js"]
