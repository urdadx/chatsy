import { db } from "@/db";
import { chat } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

/**
 * Update chat status (used for escalation workflow)
 */
export const updateChatStatus = createServerFn({ method: "POST" })
  .validator(
    (data: {
      chatId: string;
      status: "unresolved" | "resolved" | "escalated";
    }) => data,
  )
  .handler(async (ctx) => {
    try {
      const [updatedChat] = await db
        .update(chat)
        .set({ status: ctx.data.status })
        .where(eq(chat.id, ctx.data.chatId))
        .returning();

      if (!updatedChat) {
        throw new Error(`Chat with id "${ctx.data.chatId}" not found`);
      }

      return updatedChat;
    } catch (error) {
      console.error("Error updating chat status:", error);
      throw new Error("Failed to update chat status");
    }
  });

/**
 * Get chat status (useful for checking escalation)
 */
export const getChatStatus = createServerFn({ method: "GET" })
  .validator((data: string) => data)
  .handler(async (ctx) => {
    try {
      const [selectedChat] = await db
        .select({ id: chat.id, status: chat.status, title: chat.title })
        .from(chat)
        .where(eq(chat.id, ctx.data));

      if (!selectedChat) {
        throw new Error(`Chat with id "${ctx.data}" not found`);
      }

      return selectedChat;
    } catch (error) {
      console.error("Error getting chat status:", error);
      throw new Error("Failed to get chat status");
    }
  });
