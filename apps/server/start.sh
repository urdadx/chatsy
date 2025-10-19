#!/bin/sh

# Start the WebSocket server

echo "Starting WebSocket server..."

# Start websocket server in foreground
echo "Starting websocket server on port 3001..."
cd /app/apps/server && node dist/src/index.js

# Exit with status of process that exited
exit $?