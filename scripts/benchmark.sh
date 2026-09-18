#!/usr/bin/env bash
set -euo pipefail

PORT=6969
TARGET="http://localhost:$PORT/api/v1/health"
AUTOCANNON="./node_modules/.bin/autocannon"

# Required env vars (validation in src/config/env.schema.ts). The /health endpoint
# is synchronous and never touches DB/Redis, so these are just schema-valid values.
export NODE_ENV=production
export LOG_LEVEL=${LOG_LEVEL:-warn}
export COOKIE_SECRET=${COOKIE_SECRET:?COOKIE_SECRET is required (>=32 chars)}
export DATABASE_URL=${DATABASE_URL:?DATABASE_URL is required}
export REDIS_URI=${REDIS_URI:?REDIS_URI is required}

# Kill the benchmarked server no matter how the script exits.
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 1. Optimize kernel limits for high connection recycling (Linux only)
if [ "$(uname -s)" = "Linux" ]; then
  sudo sysctl -w net.ipv4.tcp_tw_reuse=1 > /dev/null
  sudo sysctl -w net.core.somaxconn=65535 > /dev/null
  ulimit -n 65535
else
  echo "WARN: kernel tuning skipped (Linux-only sysctls)."
fi

# 2. Build and start server in production mode
npm run build

# If running on Linux with 4 or more cores, isolate the server to CPU core 0
OS="$(uname -s)"
CORE_COUNT=$(nproc 2>/dev/null || sysctl -n hw.logicalcpu 2>/dev/null || echo 1)
PIN_SERVER=""
PIN_LOAD=""
if [ "$OS" = "Linux" ] && [ "$CORE_COUNT" -ge 4 ]; then
  echo "Detected $CORE_COUNT cores. Pinning server to CPU 0 and load generator to CPUs 1-$((CORE_COUNT-1))"
  PIN_SERVER="taskset -c 0"
  PIN_LOAD="taskset -c 1-$((CORE_COUNT-1))"
else
  echo "Detected $CORE_COUNT cores. Running without CPU pinning."
fi

$PIN_SERVER node dist/server.js &
SERVER_PID=$!

# 3. Wait until server responds (bounded)
echo "Waiting for server on $TARGET..."
for _ in $(seq 1 60); do
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
$PIN_LOAD "$AUTOCANNON" -c 100 -d 40 -p 10 "$TARGET"

echo "Cooling down for 5 seconds..."
sleep 5

# 5. Round 2: Official Measurement
echo "=== ROUND 2: OFFICIAL MEASUREMENT (40s) ==="
$PIN_LOAD "$AUTOCANNON" -c 100 -d 40 -p 10 "$TARGET"

# 6. Tear down server (cleanup trap fires on exit)