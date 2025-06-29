import { db } from "@/db";
import { chat, message } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";

export const getChatById = createServerFn({ method: "GET" })
  .validator((data: string) => data)
  .handler(async (ctx) => {
    try {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, ctx.data));

      if (!selectedChat) {
        throw new Error(`Chat with id "${ctx.data}" not found`);
      }

      return selectedChat;
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      throw new Error("Failed to get chat by ID");
    }
  });

export const getMessagesByChatId = createServerFn({ method: "GET" })
  .validator((data: string) => data)
  .handler(async (ctx) => {
    try {
      const results = await db
        .select()
        .from(message)
        .where(eq(message.chatId, ctx.data))
        .orderBy(asc(message.createdAt));

      return results.map((result) => ({
        ...result,
        parts: result.parts as {},
        content: result.content as string,
        role: result.role as "user" | "assistant",
        createdAt: result.createdAt,
      }));
    } catch (error) {
      console.error("Error retrieving messages:", error);
      console.log("Chat ID used:", ctx.data);
      throw new Error("Failed to get messages by chat ID");
    }
  });
