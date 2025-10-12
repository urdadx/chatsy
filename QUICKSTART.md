# 🚀 Quick Start - WebSocket Human Agent Support

## Overview
This implementation enables real-time communication between human agents and users when a chat is escalated from the AI assistant.

## 🎯 What You Need

### 1. Environment Setup

**Server (`apps/server/.env`):**
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
CORS_ORIGIN=http://localhost:3001
```

**Client (`apps/web/.env`):**
```env
VITE_WS_URL=ws://localhost:3000/ws
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Install Dependencies

Already installed:
- `ws` - WebSocket library
- `@types/ws` - TypeScript types

## 🏃 Running the System

### Terminal 1 - Start Server
```bash
cd apps/server
pnpm dev
```

### Terminal 2 - Start Web App
```bash
cd apps/web
pnpm dev
```

## 📝 How It Works

### Step 1: User Escalates Chat
1. User chats with AI assistant
2. User requests human help OR AI determines escalation needed
3. AI calls `escalate_to_human` tool
4. Chat status → `"escalated"`
5. Email sent to all organization members

### Step 2: Agent Joins
1. Agent sees escalated chat in history
2. Agent opens the chat
3. Agent sees "Join Chat" button
4. Agent clicks "Join Chat"
5. WebSocket connection established
6. Input field and "Send" button appear
7. Green "You are now live with the user" indicator shows

### Step 3: Real-Time Communication
- Both parties can message instantly
- Typing indicators work both ways
- Messages saved with proper roles:
  - User messages: `role: "user"`
  - Agent messages: `role: "human"`
- Messages persist to database
- Human agent badge shows on agent messages

## 🎨 UI Features

### Agent Interface
**Before Join:**
```
┌──────────────────────────────────────┐
│ This chat has been escalated.        │
│ Click "Join" to start assisting.     │
│ [Join Chat]                          │
└──────────────────────────────────────┘
```

**After Join:**
```
┌──────────────────────────────────────┐
│ ● You are now live with the user     │
├──────────────────────────────────────┤
│ [Messages...]                        │
│ ● ● ● User is typing...              │
├──────────────────────────────────────┤
│ [Type a message...] [Send]           │
└──────────────────────────────────────┘
```

### User Interface
```
┌──────────────────────────────────────┐
│ AI: "I've escalated to human agent"  │
│                                      │
│ 👤 Human Agent                       │
│ Hello! How can I help?               │
│                                      │
│ ● ● ● Agent is typing...             │
└──────────────────────────────────────┘
```

## 🔑 Key Components

### Server
- **`src/lib/websocket.ts`** - WebSocket server
- **`src/index.ts`** - Express + WebSocket setup
- **`src/db/schema.ts`** - Database schema

### Client
- **`src/hooks/use-chat-websocket.ts`** - WebSocket hook
- **`src/components/chat-history/chat-conversation.tsx`** - Agent UI
- **`src/components/chat/preview-message.tsx`** - Message display

## 🧪 Testing

### Test Escalation Flow
1. Open user chat interface
2. Send: "I need to speak with a human"
3. AI should escalate the chat
4. Open admin panel → Chat History
5. See escalated chat (marked with status)
6. Click on the chat
7. Click "Join Chat"
8. Start messaging

### Test WebSocket Connection
```bash
cd apps/server
node test-websocket.js
```

## 🔍 Troubleshooting

### WebSocket Not Connecting
- ✅ Check server is running on port 3000
- ✅ Verify `VITE_WS_URL` in `.env`
- ✅ Check browser console for errors
- ✅ Ensure chat status is "escalated"

### Messages Not Appearing
- ✅ Check database connection
- ✅ Verify WebSocket connection status
- ✅ Check browser network tab
- ✅ Look at server logs

### "Join Chat" Button Not Appearing
- ✅ Ensure chat status is "escalated"
- ✅ Check if already joined (refresh page)
- ✅ Verify WebSocket connection

## 📚 Documentation

- **[WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)** - Technical details
- **[CHAT_ESCALATION_FLOW.md](./apps/web/CHAT_ESCALATION_FLOW.md)** - User experience
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete summary
- **[VISUAL_GUIDE.md](./VISUAL_GUIDE.md)** - Visual diagrams

## 🎯 Next Steps

### Optional Enhancements
1. Add authentication to WebSocket
2. Implement agent presence indicators
3. Add canned responses for agents
4. Create agent queue system
5. Add file sharing capability
6. Implement read receipts
7. Add internal agent notes
8. Create analytics dashboard

## ✨ Features Implemented

- ✅ Real-time bi-directional messaging
- ✅ Typing indicators
- ✅ Connection status tracking
- ✅ "Join Chat" workflow
- ✅ Human agent badge
- ✅ Message persistence
- ✅ Escalation validation
- ✅ Error handling
- ✅ Auto-reconnection
- ✅ Mobile responsive

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server and browser console logs
3. Verify environment variables
4. Check database connection
5. Ensure WebSocket port (3000) is not blocked

## 📞 Quick Reference

**WebSocket URL**: `ws://localhost:3000/ws`  
**Health Check**: `http://localhost:3000/ws/health`  
**Server Port**: `3000`  
**Web App Port**: `3001` (or as configured)

---

**Status**: ✅ Ready to use!

Start the server, start the web app, and begin assisting users in real-time! 🎉
