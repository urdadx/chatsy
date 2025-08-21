# Escalate to Human Agent Feature Implementation

## Overview
Created a new AI tool called "escalate to human" that automatically escalates chat conversations to human agents by changing the chat status to "escalated" in the database.

## Files Created/Modified

### 1. API Endpoint
- **File**: `/routes/api/escalate-to-human.ts`
- **Purpose**: Handles the escalation logic, updates chat status to "escalated"
- **Features**:
  - Validates chat ID and escalation reason
  - Supports both embedded widgets (via embedToken) and chat preview (via session)
  - Updates chat status in database
  - Logs escalation details for monitoring

### 2. AI Tool
- **File**: `/lib/ai/tools/escalate-to-human.ts`
- **Purpose**: AI tool that triggers when escalation is needed
- **Features**:
  - Simplified parameters (reason, summary)
  - Automatic escalation without requiring user input
  - Returns confirmation message to user

### 3. UI Notification Component
- **File**: `/lib/ai/tools-ui/escalate-to-human-notification.tsx`
- **Purpose**: Shows escalation status to user
- **Features**:
  - Automatically triggers API call when mounted
  - Shows loading state during escalation
  - Displays success confirmation with escalation details
  - Handles errors gracefully

### 4. Message Component Integration
- **File**: `/components/chat/message.tsx`
- **Purpose**: Integrates escalation tool into chat interface
- **Features**:
  - Shows loading indicator during escalation
  - Displays notification component with escalation details
  - Handles tool output properly

### 5. System Prompt Update
- **File**: `/lib/ai/system-prompt.ts`
- **Purpose**: Instructs AI when to use escalation tool
- **Features**:
  - Clear guidelines for when to escalate
  - Covers various escalation scenarios (complex issues, customer requests, etc.)

### 6. Chat Endpoint Integration
- **Files**: `/routes/api/chat/index.ts`, `/routes/api/embed/chat/$embedToken.ts`
- **Purpose**: Makes escalation tool available in both chat scenarios
- **Features**:
  - Tool integrated alongside existing tools (feedback, leads, knowledge search)
  - Works in both authenticated and embedded chat scenarios

## Database Schema
The implementation uses the existing `chat` table's `status` field which already supports:
- `"unresolved"` (default)
- `"resolved"`
- `"escalated"` (used by this feature)

## How It Works

1. **AI Detection**: AI detects when escalation is needed based on conversation context
2. **Tool Execution**: AI calls `escalate_to_human` tool with reason and summary
3. **User Notification**: User sees loading indicator, then confirmation message
4. **API Call**: Notification component automatically calls `/api/escalate-to-human`
5. **Database Update**: Chat status changes from "unresolved" to "escalated"
6. **Logging**: Escalation details logged for monitoring and follow-up

## Usage Scenarios

The AI will escalate when:
- User explicitly requests to speak with a human
- Complex technical issues that AI cannot resolve
- User expresses frustration requiring human intervention
- Sensitive topics (billing, account access, complaints)
- Multiple failed resolution attempts

## Testing

To test the feature:
1. Start a conversation with the AI
2. Request to speak with a human agent
3. Observe the escalation notification
4. Check that chat status changed to "escalated" in database
5. Verify escalation details are logged in console

## Benefits

- **Seamless UX**: No forms to fill out, automatic escalation
- **Clear Communication**: User knows they've been escalated and why
- **Database Tracking**: All escalations tracked for analysis
- **Flexible Integration**: Works in both embedded and authenticated scenarios
- **Error Handling**: Graceful fallbacks for API failures
