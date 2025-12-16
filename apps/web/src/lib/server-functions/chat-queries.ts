import { db } from "@/db";
import { chat, member, message, user } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";

export const getChatById = createServerFn({ method: "GET" })
  .validator((data: string) => data)
  .handler(async (ctx) => {
    try {
      const [selectedChat] = await db
        .select({
          id: chat.id,
          createdAt: chat.createdAt,
          title: chat.title,
          userId: chat.userId,
          chatbotId: chat.chatbotId,
          visibility: chat.visibility,
          channel: chat.channel,
          status: chat.status,
          agentAssigned: chat.agentAssigned,
          chatMetaData: chat.chatMetaData as {},
          assignedUser: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(chat)
        .leftJoin(member, eq(chat.agentAssigned, member.id))
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(chat.id, ctx.data));

      // Return null if chat not found - this is valid for new chats
      return selectedChat ?? null;
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
        role: result.role as "user" | "assistant",
        createdAt: result.createdAt,
      }));
    } catch (error) {
      console.error("Error retrieving messages:", error);
      console.log("Chat ID used:", ctx.data);
      throw new Error("Failed to get messages by chat ID");
    }
  });
