import { db } from "@/db";
import { stream, chat, message, user, vote } from "@/db/schema";
import type { DBMessage } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, gt, gte, inArray, lt } from "drizzle-orm";
import z from "zod";
import { ChatSDKError } from "../errors";

const SaveChatSchema = z.object({
  userId: z.string(),
  title: z.string(),
  visibility: z.enum(["public", "private"]).default("private"),
});

// FUNCTION TO GET USER ID FROM USERNAME
export const getUserIdFromUsername = createServerFn()
  .validator((data: string) => data)
  .handler(async (ctx) => {
    try {
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, ctx.data))
        .limit(1);

      if (!result.length) {
        throw new Error("User not found");
      }

      return {
        success: true,
        userId: result[0].id,
      };
    } catch (error) {
      console.error("Error fetching user ID:", error);
      throw new Error("Failed to retrieve user ID");
    }
  });

// FUNCTION TO SAVE A CHAT
export const saveChat = createServerFn()
  .validator((data: unknown) => {
    try {
      return SaveChatSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data }) => {
    try {
      await db.insert(chat).values({
        userId: data.userId,
        title: data.title,
        visibility: data.visibility,
        createdAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error saving chat:", error);
      throw new ChatSDKError("bad_request:database", "Failed to save chat");
    }
  });

// FUNCTION TO DELETE A CHAT BY ID
const DeleteChatSchema = z.object({
  id: z.string(),
});

export const deleteChatById = createServerFn()
  .validator((data: unknown) => {
    return DeleteChatSchema.parse(data);
  })
  .handler(async ({ data: { id } }) => {
    try {
      await db.delete(vote).where(eq(vote.chatId, id));
      await db.delete(message).where(eq(message.chatId, id));
      await db.delete(stream).where(eq(stream.chatId, id));

      const [chatsDeleted] = await db
        .delete(chat)
        .where(eq(chat.id, id))
        .returning();

      return chatsDeleted;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw new Error("Failed to delete chat by id");
    }
  });

// FUNCTION TO GET CHATS BY USER ID WITH PAGINATION
export const getChatsByUserId = createServerFn()
  .validator(
    z.object({
      id: z.string(),
      limit: z.number().int().positive(),
      startingAfter: z.string().nullable(),
      endingBefore: z.string().nullable(),
    }),
  )
  .handler(async ({ data: { id, limit, startingAfter, endingBefore } }) => {
    const extendedLimit = limit + 1;

    const buildQuery = (whereCondition?: any) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    try {
      let filteredChats = [];

      if (startingAfter) {
        const [referenceChat] = await db
          .select()
          .from(chat)
          .where(eq(chat.id, startingAfter))
          .limit(1);

        if (!referenceChat) {
          throw new Error(`Chat with id ${startingAfter} not found`);
        }

        filteredChats = await buildQuery(
          gt(chat.createdAt, referenceChat.createdAt),
        );
      } else if (endingBefore) {
        const [referenceChat] = await db
          .select()
          .from(chat)
          .where(eq(chat.id, endingBefore))
          .limit(1);

        if (!referenceChat) {
          throw new Error(`Chat with id ${endingBefore} not found`);
        }

        filteredChats = await buildQuery(
          lt(chat.createdAt, referenceChat.createdAt),
        );
      } else {
        filteredChats = await buildQuery();
      }

      const hasMore = filteredChats.length > limit;

      return {
        chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
        hasMore,
      };
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw new Error("Failed to get chats by user ID");
    }
  });

// FUNCTION TO GET CHAT BY ID
export const getChatById = createServerFn()
  .validator(z.string())
  .handler(async ({ data: id }) => {
    try {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, id));

      if (!selectedChat) {
        throw new Error(`Chat with id "${id}" not found`);
      }

      return selectedChat;
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      throw new Error("Failed to get chat by ID");
    }
  });

// FUNCTION TO SAVE MESSAGES
export const saveMessages = createServerFn()
  .validator((data: DBMessage[]) => data)
  .handler(async (ctx) => {
    try {
      await db.insert(message).values(ctx.data);
      return { success: true };
    } catch (error) {
      console.error("Error saving messages:", error);
      throw new Error("Failed to save messages");
    }
  });

// FUNCTION TO GET MESSAGES BY CHAT ID
export const getMessagesByChatId = createServerFn()
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
        attachments: result.attachments as {},
      }));
    } catch (error) {
      console.error("Error retrieving messages:", error);
      throw new Error("Failed to get messages by chat ID");
    }
  });

const VoteInput = z.object({
  chatId: z.string(),
  messageId: z.string(),
  type: z.enum(["up", "down"]),
});

// FUNCTION TO VOTE ON A MESSAGE
export const voteMessage = createServerFn()
  .validator((data) => {
    const parsed = VoteInput.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid input for voteMessage");
    }
    return parsed.data;
  })
  .handler(async ({ data: { chatId, messageId, type } }) => {
    try {
      const [existingVote] = await db
        .select()
        .from(vote)
        .where(eq(vote.messageId, messageId))
        .limit(1);

      if (existingVote) {
        return await db
          .update(vote)
          .set({ isUpvoted: type === "up" })
          .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
      }

      return await db.insert(vote).values({
        chatId,
        messageId,
        isUpvoted: type === "up",
      });
    } catch (error) {
      console.error("Failed to vote message:", error);
      throw new Error("Failed to vote on message");
    }
  });

// FUNCTION TO GET VOTES BY CHAT ID
export const getVotesByChatId = createServerFn()
  .validator((data: string) => data)
  .handler(async ({ data: chatId }) => {
    try {
      return await db.select().from(vote).where(eq(vote.chatId, chatId));
    } catch (error) {
      console.error("Error fetching votes by chatId:", error);
      throw new Error("Failed to get votes by chat ID");
    }
  });

// FUNCTION TO GET MESSAGE BY ID
export const getMessageById = createServerFn()
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      const results = await db.select().from(message).where(eq(message.id, id));
      return results.map((result) => ({
        ...result,
        parts: result.parts as {},
        attachments: result.attachments as {},
      }));
    } catch (error) {
      console.error("Failed to get message by id:", error);
      throw new Error("Failed to get message by id");
    }
  });

const DeleteMessagesInput = z.object({
  chatId: z.string(),
  timestamp: z.date(),
});

// FUNCTION TO DELETE MESSAGES BY CHAT ID AFTER A SPECIFIC TIMESTAMP
export const deleteMessagesByChatIdAfterTimestamp = createServerFn()
  .validator((data) => {
    const parsed = DeleteMessagesInput.safeParse(data);
    if (!parsed.success) throw new Error("Invalid input");
    return parsed.data;
  })
  .handler(async ({ data: { chatId, timestamp } }) => {
    try {
      const messagesToDelete = await db
        .select({ id: message.id })
        .from(message)
        .where(
          and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
        );

      const messageIds = messagesToDelete.map((msg) => msg.id);

      if (messageIds.length > 0) {
        await db
          .delete(vote)
          .where(
            and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
          );

        return await db
          .delete(message)
          .where(
            and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
          );
      }
    } catch (error) {
      console.error("Failed to delete messages after timestamp:", error);
      throw new Error("Failed to delete messages after timestamp");
    }
  });

const MessageCountInput = z.object({
  id: z.string(),
  differenceInHours: z.number(),
});

// FUNCTION TO GET MESSAGE COUNT BY USER ID WITHIN A TIME FRAME
export const getMessageCountByUserId = createServerFn()
  .validator((data) => {
    const parsed = MessageCountInput.safeParse(data);
    if (!parsed.success) throw new Error("Invalid input");
    return parsed.data;
  })
  .handler(async ({ data: { id, differenceInHours } }) => {
    try {
      const threshold = new Date(
        Date.now() - differenceInHours * 60 * 60 * 1000,
      );

      const [stats] = await db
        .select({ count: count(message.id) })
        .from(message)
        .innerJoin(chat, eq(message.chatId, chat.id))
        .where(
          and(
            eq(chat.userId, id),
            gte(message.createdAt, threshold),
            eq(message.role, "user"),
          ),
        );

      return stats?.count ?? 0;
    } catch (error) {
      console.error("Failed to get message count by user id:", error);
      throw new Error("Failed to get message count");
    }
  });
