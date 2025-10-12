# WebSocket Implementation for Human Agent Support

This document describes the WebSocket implementation that enables real-time communication between human agents and users when a chat is escalated.

## Overview

When a chat is escalated (status changes to `"escalated"`), a WebSocket connection is established between the user and human agents to enable real-time messaging.

## Architecture

### Server Side (`apps/server`)

**Location**: `apps/server/src/lib/websocket.ts`

The WebSocket server manages:
- Room-based chat connections (one room per chatId)
- Message persistence to the database
- Broadcasting messages to all participants in a chat
- Typing indicators
- Escalation status validation

**Key Features**:
- Only allows WebSocket messaging when chat status is `"escalated"`
- Stores human agent messages with role `"human"` in the database
- Broadcasts messages to all connected clients in the same chat room

### Client Side (`apps/web`)

**Hook**: `apps/web/src/hooks/use-chat-websocket.ts`

A reusable hook that provides:
- Connection management
- Message sending
- Typing indicators
- Connection status tracking
- Automatic reconnection handling

**Components**:
- `ChatConversation` (`apps/web/src/components/chat-history/chat-conversation.tsx`): Admin/agent interface for responding to escalated chats
- `PreviewMessage` (`apps/web/src/components/chat/preview-message.tsx`): Displays messages with visual indicators for human agent messages

## Message Flow

1. **Escalation**: When AI assistant calls the `escalate_to_human` tool, chat status changes to `"escalated"`
2. **Connection**: Both user and agent establish WebSocket connections
3. **Real-time messaging**: Messages are sent via WebSocket and stored in the database
4. **Message display**: UI updates in real-time for both parties

## Database Schema

### Chat Table
```typescript
status: varchar("status", { enum: ["unresolved", "resolved", "escalated"] })
```

### Message Table
```typescript
role: varchar("role") // Can be: "user", "assistant", "human", "system"
```

The `"human"` role indicates a message sent by a human agent.

## WebSocket Protocol

### Message Types

#### Inbound (Client → Server)

**Join a chat**:
```json
{
  "type": "join",
  "chatId": "uuid",
  "role": "user" | "agent"
}
```

**Leave a chat**:
```json
{
  "type": "leave",
  "chatId": "uuid"
}
```

**Send a message**:
```json
{
  "type": "message",
  "chatId": "uuid",
  "text": "message content",
  "role": "user" | "agent"
}
```

**Typing indicator**:
```json
{
  "type": "typing",
  "chatId": "uuid",
  "role": "user" | "agent",
  "isTyping": true | false
}
```

#### Outbound (Server → Client)

**Joined confirmation**:
```json
{
  "type": "joined",
  "chatId": "uuid"
}
```

**New message**:
```json
{
  "type": "message",
  "chatId": "uuid",
  "message": {
    "id": "uuid",
    "chatId": "uuid",
    "role": "human" | "user",
    "parts": [{ "type": "text", "text": "content" }],
    "createdAt": "ISO date"
  }
}
```

**Typing indicator**:
```json
{
  "type": "typing",
  "chatId": "uuid",
  "role": "user" | "agent",
  "isTyping": true | false
}
```

**Error**:
```json
{
  "type": "error",
  "error": "error message"
}
```

## Environment Configuration

### Server (`apps/server/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3001
```

### Client (`apps/web/.env`)
```env
VITE_WS_URL=ws://localhost:3000/ws
# Or for production:
# VITE_WS_URL=wss://your-domain.com/ws
```

If `VITE_WS_URL` is not set, the client will automatically construct the WebSocket URL based on the current location.

## Usage

### For Admin/Agent Interface

```tsx
import { useChatWebSocket } from "@/hooks/use-chat-websocket";

const { status, isTyping, sendMessage, sendTyping, isConnected } = useChatWebSocket({
  chatId: "chat-uuid",
  role: "agent",
  onError: (err) => console.error("WebSocket error:", err),
});

// Send a message
const handleSend = () => {
  sendMessage("Hello, how can I help?");
};

// Update typing status
const handleTyping = (typing: boolean) => {
  sendTyping(typing);
};
```

### For User Chat Interface

The same hook can be used with `role: "user"`:

```tsx
const { status, isTyping, sendMessage, sendTyping, isConnected } = useChatWebSocket({
  chatId: "chat-uuid",
  role: "user",
  onMessage: (msg) => {
    // Handle incoming message from agent
  },
});
```

## Security Considerations

1. **Escalation Check**: The server validates that a chat is in `"escalated"` status before allowing WebSocket messaging
2. **CORS**: Configure `CORS_ORIGIN` environment variable to restrict allowed origins
3. **Authentication**: Consider adding authentication middleware to validate user/agent identity
4. **Rate Limiting**: Consider implementing rate limiting for message sending

## UI Features

### Human Agent Badge
Messages from human agents display a visual badge:
```tsx
<span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
  👤 Human Agent
</span>
```

### Connection Status Indicator
The input form shows connection status:
- 🔄 Connecting...
- ✅ Connected (ready to send)
- ❌ Connection error
- ⚠️ Disconnected

### Typing Indicators
Visual feedback when the other party is typing:
```
● ● ● User is typing...
```

## Testing

### Start the WebSocket Server
```bash
cd apps/server
pnpm dev
```

### Start the Web Application
```bash
cd apps/web
pnpm dev
```

### Test Escalation Flow
1. Start a chat with the chatbot
2. Ask the AI to escalate to a human agent
3. The chat status will change to "escalated"
4. Navigate to the admin chat history view
5. Open the escalated chat
6. Send messages in real-time

## Troubleshooting

### WebSocket Connection Fails
- Check that the server is running on the correct port
- Verify `VITE_WS_URL` environment variable
- Check browser console for connection errors
- Ensure CORS is properly configured

### Messages Not Appearing
- Verify chat status is "escalated"
- Check database connectivity
- Look for errors in server logs
- Confirm WebSocket connection is established

### Typing Indicators Not Working
- Ensure both parties are connected to the same chat room
- Check that typing events are being sent
- Verify WebSocket message handling in the hook

## Future Enhancements

- [ ] Add user authentication/authorization
- [ ] Implement message read receipts
- [ ] Add file upload support
- [ ] Implement message search
- [ ] Add agent availability status
- [ ] Queue management for multiple escalated chats
- [ ] Analytics and reporting
- [ ] Message history pagination
- [ ] Offline message queuing
- [ ] Push notifications for new messages
