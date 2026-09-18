#!/usr/bin/env bash
set -euo pipefail

PORT=6969
TARGET="http://localhost:$PORT/api/v1/health"
AUTOCANNON="./node_modules/.bin/autocannon"

# Force maximum silence for the benchmark run
export NODE_ENV=production
export LOG_LEVEL=silent
export COOKIE_SECRET=${COOKIE_SECRET:?COOKIE_SECRET is required (>=32 chars)}
export DATABASE_URL=${DATABASE_URL:?DATABASE_URL is required}
export REDIS_URI=${REDIS_URI:?REDIS_URI is required}

SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill -9 "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Optimize kernel limits for high connection recycling (Linux only)
if [ "$(uname -s)" = "Linux" ]; then
  sudo sysctl -w net.ipv4.tcp_tw_reuse=1 > /dev/null 2>&1 || true
  sudo sysctl -w net.core.somaxconn=65535 > /dev/null 2>&1 || true
  ulimit -n 65535 2>/dev/null || true
fi

# 2. Start server without artificial taskset restrictions
# (Allows CFS to schedule the Node event loop freely across the quota budget)
node dist/server.js &
SERVER_PID=$!

# 3. Wait until server responds (bounded to 30s)
echo "Waiting for server on $TARGET..."
for _ in $(seq 1 30); do
  if curl -s -f "$TARGET" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -s -f "$TARGET" > /dev/null 2>&1; then
  echo "ERROR: server failed to start on $TARGET" >&2
  exit 1
fi
echo "Server is ready."

# 4. Round 1: Warm-up (triggers V8 JIT and TurboFan compilation)
echo "=== ROUND 1: WARM-UP (40s) ==="
"$AUTOCANNON" -c 100 -d 40 -p 10 "$TARGET"

echo "Cooling down for 5 seconds..."
sleep 5

# 5. Round 2: Official Measurement
echo "=== ROUND 2: OFFICIAL MEASUREMENT (40s) ==="
"$AUTOCANNON" -c 100 -d 40 -p 10 "$TARGET"
