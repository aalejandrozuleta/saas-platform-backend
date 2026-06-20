#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:./node_modules/.bin:${PATH}"

_stop() {
  echo "[config-service] Received shutdown signal, stopping..."
  if [ -n "$NEST_PID" ]; then
    kill -SIGTERM "$NEST_PID" 2>/dev/null || true
    wait "$NEST_PID" 2>/dev/null || true
  fi
  echo "[config-service] Stopped."
  exit 0
}
trap _stop TERM INT

echo "[config-service] Running Prisma migrations..."
prisma migrate deploy

echo "[config-service] Generating Prisma client..."
prisma generate

echo "[config-service] Starting in watch mode..."
nest start --watch &
NEST_PID=$!

wait "$NEST_PID"
