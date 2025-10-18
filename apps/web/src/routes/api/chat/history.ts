import { db } from "@/db";
import { chat, chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { type SQL, and, desc, eq, gt, lt } from "drizzle-orm";
import z from "zod";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional().nullable(),
  direction: z.enum(["next", "prev"]).default("next"),
  filter: z.enum(["24h", "7d", "30d", "90d", "all"]).default("24h"),
  status: z.enum(["all", "unresolved", "resolved", "escalated"]).default("all"),
});

export const ServerRoute = createServerFileRoute("/api/chat/history").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const chatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!chatbotId) {
      return json(
        { error: "Unauthorized: Please log in or no active chatbot" },
        { status: 401 },
      );
    }

    const [chatbotData] = await db
      .select({
        organizationId: chatbot.organizationId,
      })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId));

    if (!chatbotData) {
      return new Response("Chatbot not found", { status: 404 });
    }

    const membership = await isUserMemberOfOrganization(
      session.user.id,
      chatbotData.organizationId,
    );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(request.url);
    const result = querySchema.safeParse(Object.fromEntries(url.searchParams));

    if (!result.success) {
      return new Response("Invalid query params", { status: 400 });
    }

    const { limit, cursor, filter, status } = result.data;

    // Time filtering
    let timeFilter: SQL<any> | undefined;
    if (filter !== "all") {
      const now = new Date();
      const timeMap = {
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      };
      timeFilter = gt(chat.createdAt, timeMap[filter]);
    }

    // Status filtering
    let statusFilter: SQL<any> | undefined;
    if (status !== "all") {
      statusFilter = eq(chat.status, status);
    }

    try {
      const whereConditions = [eq(chat.chatbotId, chatbotId)];

      if (timeFilter) whereConditions.push(timeFilter);
      if (statusFilter) whereConditions.push(statusFilter);

      if (cursor) {
        const [refChat] = await db
          .select()
          .from(chat)
          .where(and(eq(chat.id, cursor), eq(chat.chatbotId, chatbotId)))
          .limit(1);

        if (!refChat) {
          throw new Error("Chat not found");
        }
        whereConditions.push(lt(chat.createdAt, refChat.createdAt));
      }

      const chats = await db
        .select()
        .from(chat)
        .where(and(...whereConditions))
        .orderBy(desc(chat.createdAt))
        .limit(limit + 1);

      const hasMore = chats.length > limit;
      const items = hasMore ? chats.slice(0, limit) : chats;

      const chatsData = {
        chats: items,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      };

      return json(chatsData);
    } catch (err) {
      console.error("GET /api/chat/history error:", err);
      if (err instanceof Error && err.message === "Chat not found") {
        return new Response("Chat not found", { status: 404 });
      }
      return new Response("Failed to fetch chats", { status: 500 });
    }
  },
});
