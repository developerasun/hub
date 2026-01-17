#!/bin/bash

echo "🧹 Cleaning up previous processes..."
trap 'kill $(jobs -p)' EXIT # @dev trap [commands] [signals]

echo "🚀 Starting Local Worker..."
pnpm dev:cron &
sleep 3

# see here: https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/#background
echo "⏰ Triggering Scheduled Task..."
curl -sS "http://localhost:8787/__scheduled?cron=*%2F3+*+*+*+*"