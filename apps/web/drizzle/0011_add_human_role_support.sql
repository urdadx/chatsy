-- Migration: Add support for human agent messages
-- This migration ensures the Message table can store messages from human agents
-- by allowing 'human' as a valid role value.

-- The role column already exists as varchar, so no schema change is needed.
-- However, we should verify existing constraints don't prevent 'human' values.

-- Add a comment to document the valid role values
COMMENT ON COLUMN "Message".role IS 'Message role: user, assistant, human, system, or tool';

-- Optional: Add an index for querying messages by role
CREATE INDEX IF NOT EXISTS "Message_role_idx" ON "Message"(role);

-- Optional: Add an index for querying escalated chats
CREATE INDEX IF NOT EXISTS "Chat_status_idx" ON "Chat"(status);

-- Optional: Add a composite index for efficient chat message queries
CREATE INDEX IF NOT EXISTS "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");
