#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

have() { command -v "$1" >/dev/null 2>&1; }

if ! have docker; then
  echo "ERROR: docker is required but not found in PATH" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "ERROR: docker compose (or docker-compose) is required" >&2
  exit 1
fi

echo "==> Stopping and removing existing containers"
"${COMPOSE[@]}" down

echo "==> Building images"
"${COMPOSE[@]}" build

echo "==> Starting services (detached)"
"${COMPOSE[@]}" up -d

run_in_service() {
  local service="$1"
  shift
  local cmd=("$@")
  local tries=20
  local delay=1

  for ((i=1; i<=tries; i++)); do
    if "${COMPOSE[@]}" exec -T "$service" sh -lc "${cmd[*]}"; then
      return 0
    fi
    echo "   ... $service not ready yet (attempt $i/$tries). Retrying in ${delay}s"
    sleep "$delay"
    ((delay++))
  done

  echo "ERROR: failed to run in $service after $tries attempts" >&2
  return 1
}

echo "==> Installing Ruby gems in backend (idempotent)"
run_in_service backend "bundle check || bundle install"

echo "==> Installing Node modules in frontend (idempotent)"
run_in_service frontend "npm install"

echo "✅ Setup complete. Services are up and dependencies are installed."


