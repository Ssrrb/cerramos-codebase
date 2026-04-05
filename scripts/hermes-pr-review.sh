#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref '$BASE_REF' was not found."
  echo "Usage: scripts/hermes-pr-review.sh [base-ref]"
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

echo "Hermes PR review context"
echo "Base ref: $BASE_REF"
echo "Branch: $(git branch --show-current)"
echo
echo "Changed files:"
printf '%s\n' "$CHANGED_FILES"

echo
echo "Diff summary:"
git diff --stat "$BASE_REF"...HEAD

run_step "Git diff hygiene" git diff --check "$BASE_REF"...HEAD

if has_change '^(apps/app/|packages/auth/|packages/database/|packages/design-system/|packages/notifications/|packages/security/|packages/storage/)'; then
  run_step "App tests" bun run --filter app test
  run_step "App typecheck" bun run --filter app typecheck
fi

if has_change '^(apps/web/|packages/auth/|packages/cms/|packages/database/|packages/design-system/|packages/email/|packages/internationalization/|packages/rate-limit/|packages/security/|packages/seo/|packages/storage/)'; then
  run_step "Web tests" bun run --filter web test
  run_step "Web typecheck" bun run --filter web typecheck
fi

if has_change '^(packages/database/|apps/app/app/api/|apps/web/app/api/)'; then
  run_step "Database tests" bun run --filter @repo/database test
  run_step "Database typecheck" bun run --filter @repo/database typecheck
fi

if has_change '^packages/design-system/'; then
  run_step "Design system typecheck" bun run --filter @repo/design-system typecheck
fi

echo
cat <<EOF
Hermes review checklist for cerramos-codebase:
- Verify product-link changes preserve separate order and payment states.
- Treat merchant app (apps/app) as operational source of truth.
- Validate public checkout behavior in apps/web against product-link status, expiration, and commerce trust state.
- Re-check database migrations whenever packages/database or product-link APIs changed.
EOF
