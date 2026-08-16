#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:./node_modules/.bin:${PATH}"

_stop() {
  echo "[company-service] Received shutdown signal, stopping..."
  if [ -n "$NEST_PID" ]; then
    kill -SIGTERM "$NEST_PID" 2>/dev/null || true
    wait "$NEST_PID" 2>/dev/null || true
  fi
  echo "[company-service] Stopped."
  exit 0
}
trap _stop TERM INT

echo "[company-service] Running Prisma migrations..."
prisma migrate deploy

echo "[company-service] Generating Prisma client..."
prisma generate

echo "[company-service] Syncing generated client to dist..."
node -e "const{cpSync}=require('fs');cpSync('src/generated','dist/generated',{recursive:true,filter:s=>!s.includes('node_modules')})"

echo "[company-service] Starting in watch mode..."
nest start --watch &
NEST_PID=$!

wait "$NEST_PID"
