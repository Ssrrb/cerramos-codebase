#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"
MODE="${2:-quick}"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref '$BASE_REF' was not found."
  echo "Usage: scripts/hermes-devops.sh [base-ref] [quick|full]"
  exit 1
fi

CHANGED_FILES="$(git diff --name-only "$BASE_REF"...HEAD)"

if [[ -z "$CHANGED_FILES" ]]; then
  echo "No files changed relative to $BASE_REF. Falling back to working tree diff."
  CHANGED_FILES="$(git diff --name-only)"
fi

if [[ -z "$CHANGED_FILES" ]]; then
  echo "No changed files detected."
  exit 0
fi

has_change() {
  local pattern="$1"
  printf '%s\n' "$CHANGED_FILES" | grep -Eq "$pattern"
}

run_step() {
  local label="$1"
  shift
  echo
  echo "==> $label"
  "$@"
}

echo "Hermes devops gate"
echo "Base ref: $BASE_REF"
echo "Mode: $MODE"
echo
printf '%s\n' "$CHANGED_FILES"

run_step "Repo health" git diff --check "$BASE_REF"...HEAD
run_step "App tests" bun run --filter app test
run_step "Web tests" bun run --filter web test
run_step "Database tests" bun run --filter @repo/database test
run_step "App typecheck" bun run --filter app typecheck
run_step "Web typecheck" bun run --filter web typecheck
run_step "Database typecheck" bun run --filter @repo/database typecheck

if has_change '^packages/design-system/'; then
  run_step "Design system typecheck" bun run --filter @repo/design-system typecheck
fi

if [[ "$MODE" == "full" ]]; then
  if has_change '^(apps/app/|packages/auth/|packages/database/|packages/design-system/|packages/notifications/|packages/security/|packages/storage/)'; then
    run_step "App build" bun run --filter app build
  fi

  if has_change '^(apps/web/|packages/auth/|packages/cms/|packages/database/|packages/design-system/|packages/email/|packages/internationalization/|packages/rate-limit/|packages/security/|packages/seo/|packages/storage/)'; then
    run_step "Web build" bun run --filter web build
  fi
fi

if has_change '^packages/database/drizzle/'; then
  echo
  echo "Database migration files changed. Confirm the matching meta snapshots and runtime callers stayed in sync."
fi

cat <<EOF

Cerramos-specific deployment notes:
- Product-link work should validate both merchant surfaces (apps/app) and public checkout flows (apps/web).
- Changes touching packages/database or app/api/web/api should be treated as deploy-sensitive.
- Keep payment status and order status checks separate in reviews and release gates.
EOF
