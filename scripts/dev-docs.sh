#!/usr/bin/env bash

set -euo pipefail

port="${DOCS_PORT:-3004}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
docs_dir="$repo_root/apps/docs"

node_version_for() {
  local node_bin="$1"
  "$node_bin" -p "process.versions.node"
}

is_supported_mintlify_node() {
  local version="$1"
  local major minor

  major="${version%%.*}"
  minor="${version#*.}"
  minor="${minor%%.*}"

  if (( major < 20 || major >= 25 )); then
    return 1
  fi

  if (( major == 20 && minor < 17 )); then
    return 1
  fi

  return 0
}

find_compatible_node() {
  local candidate version

  if [[ -n "${DOCS_NODE_BIN:-}" && -x "${DOCS_NODE_BIN}" ]]; then
    version="$(node_version_for "${DOCS_NODE_BIN}")"
    if is_supported_mintlify_node "${version}"; then
      printf '%s\n' "${DOCS_NODE_BIN}"
      return 0
    fi
  fi

  if command -v node >/dev/null 2>&1; then
    candidate="$(command -v node)"
    version="$(node_version_for "${candidate}")"
    if is_supported_mintlify_node "${version}"; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  fi

  for candidate in \
    "$HOME"/.nvm/versions/node/*/bin/node \
    "$HOME"/.volta/tools/image/node/*/bin/node
  do
    [[ -x "${candidate}" ]] || continue

    version="$(node_version_for "${candidate}")"
    if is_supported_mintlify_node "${version}"; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done

  return 1
}

if node_bin="$(find_compatible_node)"; then
  node_version="$(node_version_for "${node_bin}")"
  echo "[docs] Starting Mintlify with Node ${node_version} via ${node_bin}" >&2
  cd "${docs_dir}"
  exec "${node_bin}" ./node_modules/mintlify/index.js dev --port "${port}"
fi

default_node_version="unavailable"
if command -v node >/dev/null 2>&1; then
  default_node_version="$(node -p "process.versions.node")"
fi

echo "[docs] Mintlify dev requires Node >=20.17 and <25. Current default Node is ${default_node_version}." >&2
echo "[docs] Docs startup is being skipped so Turbo can keep the rest of the workspace running." >&2
echo "[docs] Set DOCS_NODE_BIN to a compatible node binary, or install Node 20, 22, or 24 under nvm/volta." >&2

while true; do
  sleep 3600
done
