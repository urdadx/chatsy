#!/bin/sh

# Start both the web app and websocket server

echo "Starting services..."

# Start websocket server in background
echo "Starting websocket server on port 3001..."
cd /app/apps/server && PORT=3001 node dist/index.js &

# Start web app in foreground  
echo "Starting web app on port 3000..."
cd /app/apps/web && node .output/server/index.mjs &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?