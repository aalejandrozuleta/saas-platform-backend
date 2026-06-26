#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:/app/services/notification-service/node_modules/.bin:${PATH}"

_stop() {
  echo "[notification-service] Received shutdown signal, stopping..."
  if [ -n "$NEST_PID" ]; then
    kill -SIGTERM "$NEST_PID" 2>/dev/null || true
    wait "$NEST_PID" 2>/dev/null || true
  fi
  echo "[notification-service] Stopped."
  exit 0
}
trap _stop TERM INT

echo "[notification-service] Starting in watch mode..."
nest start --watch &
NEST_PID=$!

wait "$NEST_PID"
