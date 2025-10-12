# Chat Escalation Flow - User Experience

This document describes the complete user experience flow when a chat is escalated from AI to a human agent.

## 🔄 Complete Flow

### 1. User Initiates Chat
- User starts conversation with AI chatbot
- AI assistant handles initial queries

### 2. Escalation Triggered
**Trigger Points:**
- User explicitly asks to speak with a human
- AI determines issue is too complex
- AI detects frustration or specific keywords

**What Happens:**
```typescript
// AI calls escalate_to_human tool
escalate_to_human({
  reason: "complex-issue" | "customer-request" | "technical-problem" | "billing" | "other"
})
```

**Results:**
1. Chat status changes to `"escalated"` in database
2. Email notifications sent to all organization members
3. User sees escalation notification in chat
4. WebSocket connection becomes available

### 3. Human Agent View

**Before Joining:**
```
┌─────────────────────────────────────────┐
│ Chat History - Escalated Chats          │
├─────────────────────────────────────────┤
│ 🔴 [ESCALATED] User needs help          │
│    Started: 2 minutes ago               │
│    Last message: "Can I speak to human?"│
└─────────────────────────────────────────┘
```

**Agent Opens Chat:**
```
┌─────────────────────────────────────────┐
│ Chat Conversation                        │
├─────────────────────────────────────────┤
│ [Previous AI conversation shown]         │
│                                          │
│ ╭───────────────────────────────────╮  │
│ │ AI: I have escalated your issue   │  │
│ │     to a human agent. They will   │  │
│ │     be with you shortly...        │  │
│ ╰───────────────────────────────────╯  │
├─────────────────────────────────────────┤
│ This chat has been escalated.           │
│ Click "Join" to start assisting.        │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │      [Join Chat]                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Agent Joins Chat

**Agent clicks "Join Chat":**
- WebSocket connection established
- `hasJoined` state set to `true`
- Input field becomes active
- Real-time communication begins

**After Joining:**
```
┌─────────────────────────────────────────┐
│ ● You are now live with the user        │
├─────────────────────────────────────────┤
│ [Previous messages...]                   │
│                                          │
│ ╭───────────────────────────────────╮  │
│ │ 👤 Human Agent                     │  │
│ │ Hello! I'm here to help you.       │  │
│ ╰───────────────────────────────────╯  │
│                                          │
│ ● ● ● User is typing...                 │
├─────────────────────────────────────────┤
│ [Type a message...            ] [Send]  │
└─────────────────────────────────────────┘
```

### 5. Real-time Communication

**Features Active:**
- ✅ Instant message delivery (both directions)
- ✅ Typing indicators
- ✅ Message persistence to database
- ✅ Connection status indicators
- ✅ "Human Agent" badge on agent messages

**Message Flow:**
1. Agent types → Typing indicator shown to user
2. Agent sends → Message saved with role `"human"`
3. User receives message instantly via WebSocket
4. User can reply in real-time
5. Both parties see typing indicators

### 6. User View (During Escalation)

**User sees:**
```
┌─────────────────────────────────────────┐
│ Chatbot                                  │
├─────────────────────────────────────────┤
│ ╭───────────────────────────────────╮  │
│ │ AI: I have escalated your issue   │  │
│ │     to a human agent...           │  │
│ ╰───────────────────────────────────╯  │
│                                          │
│ ╭───────────────────────────────────╮  │
│ │ 👤 Human Agent                     │  │
│ │ Hello! I'm Sarah, how can I help?  │  │
│ ╰───────────────────────────────────╯  │
│                                          │
│ ● ● ● Agent is typing...                │
├─────────────────────────────────────────┤
│ [Type your message...        ] [Send]   │
└─────────────────────────────────────────┘
```

## 🎨 Visual Elements

### Connection Status Indicators

**Connecting:**
```
🔄 Connecting...
```

**Connected (Agent Joined):**
```
● You are now live with the user
```

**Error:**
```
❌ Connection error
```

**Disconnected:**
```
⚠️ Disconnected
```

### Typing Indicators

**Style:**
```tsx
<div className="flex gap-1">
  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
</div>
<span>User is typing...</span>
```

### Human Agent Badge

**On every agent message:**
```tsx
<span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium">
  <svg className="h-3 w-3 mr-1">...</svg>
  Human Agent
</span>
```

## 📊 Database Schema

### Chat Status
```typescript
status: "unresolved" | "resolved" | "escalated"
```

### Message Roles
```typescript
role: "user" | "assistant" | "human" | "system"
```

**Role Meanings:**
- `user`: End user messages
- `assistant`: AI chatbot messages
- `human`: Human agent messages (NEW!)
- `system`: System-generated messages

## 🔐 Security & Validation

### Server-Side Checks
```typescript
// Only allow WebSocket messaging when escalated
async function ensureEscalated(chatId: string) {
  const chat = await db.query.chat.findFirst({
    where: eq(chat.id, chatId)
  });
  
  if (!chat) throw new Error("Chat not found");
  if (chat.status !== "escalated") {
    throw new Error("Chat is not escalated");
  }
}
```

### Client-Side UX
- Join button disabled until WebSocket connects
- Send button disabled until agent joins
- Typing indicators only work after joining
- Clear connection status feedback

## 📱 Responsive Behavior

### Mobile View
```
┌─────────────────┐
│ ● Live with user│
├─────────────────┤
│ [Messages...]   │
│                 │
│ ╭─────────────╮ │
│ │ 👤 Agent    │ │
│ │ Hello!      │ │
│ ╰─────────────╯ │
├─────────────────┤
│ [Type...] [Send]│
└─────────────────┘
```

### Desktop View
```
┌───────────────────────────────────────────────┐
│ ● You are now live with the user              │
├───────────────────────────────────────────────┤
│                                                │
│  [Previous conversation...]                    │
│                                                │
│  ╭──────────────────────────────────────────╮ │
│  │ 👤 Human Agent                            │ │
│  │ Hello! I'm here to help you today.        │ │
│  ╰──────────────────────────────────────────╯ │
│                                                │
│  ● ● ● User is typing...                      │
│                                                │
├───────────────────────────────────────────────┤
│ [Type a message...                    ] [Send]│
└───────────────────────────────────────────────┘
```

## 🚀 Performance Considerations

### WebSocket Connection
- Automatic reconnection on disconnect
- Connection status tracking
- Error handling and user feedback

### Message Updates
- Real-time via WebSocket broadcasts
- Query invalidation for message list
- Optimistic UI updates possible

### Typing Indicators
- Debounced to prevent spam
- Only sent when actually typing
- Cleared when input is empty

## 🧪 Testing Checklist

- [ ] Agent can see escalated chats in history
- [ ] "Join Chat" button appears before joining
- [ ] WebSocket connects when viewing escalated chat
- [ ] "Join Chat" changes to input + "Send" after joining
- [ ] Green "live" indicator shows after joining
- [ ] Agent messages save with role "human"
- [ ] Agent messages display with "Human Agent" badge
- [ ] Typing indicators work both directions
- [ ] Messages appear in real-time for both parties
- [ ] Connection status updates correctly
- [ ] Error states display properly
- [ ] Works on mobile and desktop
- [ ] Multiple agents can join same chat
- [ ] Message history persists after page refresh

## 🎯 Next Steps

### Potential Enhancements
1. **Agent Presence**: Show which agents are viewing the chat
2. **Transfer**: Allow transferring to another agent
3. **Canned Responses**: Quick reply templates for agents
4. **File Sharing**: Allow agents to send files
5. **Internal Notes**: Private notes between agents
6. **Chat Resolution**: Mark chat as resolved when done
7. **Satisfaction Survey**: Post-chat user feedback
8. **Analytics**: Track response times, resolution rates
9. **Queue System**: Assign chats to available agents
10. **Agent Status**: Available, Busy, Away indicators
