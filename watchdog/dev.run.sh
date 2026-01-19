#!/bin/bash

echo "🧹 Cleaning up previous processes..."
pkill -9 -f wrangler
lsof -ti:8787 | xargs kill -9 2>/dev/null

echo "📌 Registering a process cleaner..."
trap "pkill -9 -f wrangler" EXIT

echo "🚀 Starting Local Worker..."
pnpm dev:cron &
sleep 5

# see here: https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/#background
echo "⏰ Triggering Scheduled Task..."
curl -sS "http://localhost:8787/__scheduled?cron=*%2F3+*+*+*+*"

echo -e "\n✅ Test finished. Cleaning up..."