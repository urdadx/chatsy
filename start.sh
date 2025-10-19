#!/bin/sh

# Start both the web app and websocket server

echo "Starting client..."

# Start web app in foreground  
echo "Starting web app on port 3000..."
cd /app/apps/web && node .output/server/index.mjs &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?