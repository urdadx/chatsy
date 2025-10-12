# Quick Start Guide - WebSocket Implementation

This guide will help you get the WebSocket server running and test the real-time chat functionality.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Both `apps/server` and `apps/web` packages installed

## Step 1: Environment Setup

### Server Environment (`apps/server/.env`)

Create or update your `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
CORS_ORIGIN=http://localhost:3001
```

### Web Environment (`apps/web/.env`)

Create or update your `.env` file:

```env
VITE_WS_URL=ws://localhost:3000/ws
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

## Step 2: Start the Server

Open a terminal and run:

```bash
cd apps/server
pnpm dev
```

You should see:
```
Server is running on port 3000 (ws path: /ws)
```

## Step 3: Start the Web Application

Open another terminal and run:

```bash
cd apps/web
pnpm dev
```

## Step 4: Test the WebSocket Connection

### Option A: Using the Test Script

```bash
cd apps/server
node test-websocket.js <your-chat-id>
```

Replace `<your-chat-id>` with an actual escalated chat ID from your database.

### Option B: Manual Testing

1. **Create a chat and escalate it:**
   - Start a conversation with your chatbot
   - Ask the AI to escalate to a human agent
   - The chat status will change to "escalated"

2. **Open the admin interface:**
   - Navigate to `/admin/chat-history`
   - Find the escalated chat in the list
   - Click on it to open the conversation

3. **Test real-time messaging:**
   - Type a message in the input field
   - Click "Send"
   - The message should appear immediately
   - If you have another browser/tab open with the user view, you'll see it there too

## Step 5: Verify Database

Check that messages are being stored with the correct role:

```sql
SELECT id, "chatId", role, parts, "createdAt" 
FROM "Message" 
WHERE "chatId" = 'your-chat-id' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

Human agent messages should have `role = 'human'`.

## Troubleshooting

### Connection Issues

**Problem**: WebSocket connection fails with "Connection error"

**Solutions**:
1. Verify the server is running on port 3000
2. Check `VITE_WS_URL` in your `.env` file
3. Ensure no firewall is blocking the connection
4. Check browser console for detailed error messages

### Chat Not Escalated

**Problem**: "Chat is not escalated" error when trying to connect

**Solutions**:
1. Verify the chat status in the database:
   ```sql
   SELECT id, title, status FROM "Chat" WHERE id = 'your-chat-id';
   ```
2. Manually update the chat status if needed:
   ```sql
   UPDATE "Chat" SET status = 'escalated' WHERE id = 'your-chat-id';
   ```

### Messages Not Appearing

**Problem**: Messages sent but not appearing in the UI

**Solutions**:
1. Check browser console for WebSocket errors
2. Verify the message was saved to the database
3. Check that the `chatId` matches in both the WebSocket message and database
4. Ensure React Query is refetching after new messages

### Typing Indicators Not Working

**Problem**: "User is typing..." not showing

**Solutions**:
1. Verify both clients are connected to the same chat
2. Check that typing events are being sent in the WebSocket
3. Ensure the `role` is different between sender and receiver

## Testing Checklist

- [ ] Server starts without errors
- [ ] WebSocket health endpoint responds: `http://localhost:3000/ws/health`
- [ ] Can connect to WebSocket at `ws://localhost:3000/ws`
- [ ] Join message succeeds for escalated chats
- [ ] Messages are stored in database with correct role
- [ ] Messages appear in real-time in the UI
- [ ] Typing indicators work
- [ ] Connection status shows correctly
- [ ] Human agent badge appears on agent messages
- [ ] Multiple clients can connect to the same chat
- [ ] Messages broadcast to all connected clients

## Next Steps

Once basic functionality is working:

1. **Add Authentication**: Implement user/agent authentication for WebSocket connections
2. **Deploy**: Configure WebSocket for production with WSS (secure WebSocket)
3. **Scale**: Consider using Redis for multi-server WebSocket support
4. **Monitor**: Add logging and monitoring for WebSocket connections
5. **Enhance UI**: Add more features like file uploads, emojis, message reactions

## Production Deployment

For production, update your environment variables:

```env
# Server
PORT=3000
CORS_ORIGIN=https://yourdomain.com
DATABASE_URL=postgresql://...

# Web
VITE_WS_URL=wss://api.yourdomain.com/ws
```

Ensure your reverse proxy (nginx, etc.) supports WebSocket connections:

```nginx
location /ws {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Support

If you encounter issues not covered here, check:
- Server logs for detailed error messages
- Browser console for client-side errors
- Database logs for connection issues
- The main [WEBSOCKET_IMPLEMENTATION.md](../WEBSOCKET_IMPLEMENTATION.md) documentation
