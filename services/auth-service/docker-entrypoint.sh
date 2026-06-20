#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:./node_modules/.bin:${PATH}"

_stop() {
  echo "[auth-service] Received shutdown signal, stopping..."
  if [ -n "$NEST_PID" ]; then
    kill -SIGTERM "$NEST_PID" 2>/dev/null || true
    wait "$NEST_PID" 2>/dev/null || true
  fi
  echo "[auth-service] Stopped."
  exit 0
}
trap _stop TERM INT

echo "[auth-service] Running Prisma migrations..."
prisma migrate deploy

echo "[auth-service] Generating Prisma client..."
prisma generate

echo "[auth-service] Starting in watch mode..."
nest start --watch &
NEST_PID=$!

wait "$NEST_PID"
