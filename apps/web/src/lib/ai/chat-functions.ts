import { db } from "@/db";
import { chat, chatbot, member, message, vote } from "@/db/schema";
import type { Chat, DBMessage } from "@/db/schema";
import type { CustomerSubscription } from "@polar-sh/sdk/models/components/customersubscription.js";
import { auth } from "auth";
import {
  type SQL,
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
} from "drizzle-orm";
import { ChatSDKError } from "../errors";
import type { VisibilityType } from "../types";

// FUNCTION TO CHECK IF USER IS A MEMBER OF AN ORGANIZATION
export async function isUserMemberOfOrganization(
  userId: string,
  organizationId: string,
) {
  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    );

  return !!membership;
}

// FUNCTION TO GET CHATBOT DATA BY EMBED TOKEN
export async function getChatbotDataByPlatformIdentifier(
  platformIdentifier: string,
) {
  const isEmbedToken = platformIdentifier.startsWith("embed_");

  const [chatbotData] = await db
    .select({
      id: chatbot.id,
      organizationId: chatbot.organizationId,
      name: chatbot.name,
      isEmbeddingEnabled: chatbot.isEmbeddingEnabled,
      allowedDomains: chatbot.allowedDomains,
    })
    .from(chatbot)
    .where(
      isEmbedToken
        ? eq(chatbot.embedToken, platformIdentifier)
        : eq(chatbot.name, platformIdentifier),
    );
  return chatbotData;
}

export async function hasActiveOrganizationSubscription(
  organizationId: string,
  headers?: any,
): Promise<boolean> {
  const subscriptionResponse = await auth.api.subscriptions({
    query: {
      page: 1,
      limit: 1,
      active: true,
      referenceId: organizationId,
    },
    headers,
  });

  const subscription = subscriptionResponse?.result?.items?.[0] as
    | CustomerSubscription
    | undefined;

  return subscription?.status === "active";
}

// FUNCTION TO SAVE A CHAT
export async function saveChat({
  id,
  userId,
  title,
  visibility,
  chatbotId,
  channel = "web",
}: {
  id?: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
  chatbotId: string;
  channel?: "web" | "widget" | "whatsapp" | "telegram";
}) {
  try {
    return await db
      .insert(chat)
      .values({
        id,
        createdAt: new Date(),
        userId,
        title,
        visibility,
        chatbotId,
        channel,
      })
      .onConflictDoNothing();
  } catch (error) {
    console.log("Error saving chat:", error);
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export const deleteChatById = async ({ id }: { id: string }) => {
  try {
    const [existingChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id))
      .limit(1);

    if (!existingChat) {
      throw new ChatSDKError("not_found:chat", "Chat not found");
    }

    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();

    return chatsDeleted;
  } catch (error) {
    console.error("Error deleting chat:", error);
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id",
    );
  }
};

// FUNCTION TO GET CHATS BY USER ID WITH PAGINATION
export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
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

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id",
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.log("Error saving messages:", error);
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

// FUNCTION TO GET MESSAGES BY CHAT ID
export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id",
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));

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
    console.log("Error voting message:", error);
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id",
    );
  }
}

export async function getTotalVotes({ chatbotId }: { chatbotId: string }) {
  try {
    const upvotes = await db
      .select({ count: count(vote.messageId) })
      .from(vote)
      .innerJoin(chat, eq(vote.chatId, chat.id))
      .where(and(eq(vote.isUpvoted, true), eq(chat.chatbotId, chatbotId)));
    const downvotes = await db
      .select({ count: count(vote.messageId) })
      .from(vote)
      .innerJoin(chat, eq(vote.chatId, chat.id))
      .where(and(eq(vote.isUpvoted, false), eq(chat.chatbotId, chatbotId)));
    return { upvotes: upvotes[0].count, downvotes: downvotes[0].count };
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get total votes");
  }
}

// FUNCTION TO GET MESSAGE BY ID
export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id",
    );
  }
}

// FUNCTION TO DELETE MESSAGES BY CHAT ID AFTER A SPECIFIC TIMESTAMP
export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

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
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp",
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user"),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id",
    );
  }
}
