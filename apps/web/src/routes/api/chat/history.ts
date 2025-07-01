import { db } from "@/db";
import { chat } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { type SQL, and, desc, eq, gt, lt } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional().nullable(),
  direction: z.enum(["next", "prev"]).default("next"),
  filter: z.enum(["24h", "7d", "30d", "90d", "all"]).default("24h"),
});

export const ServerRoute = createServerFileRoute("/api/chat/history").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const result = querySchema.safeParse(Object.fromEntries(url.searchParams));

    if (!result.success) {
      return new Response("Invalid query params", { status: 400 });
    }

    const { limit, cursor, filter } = result.data;
    const userId = session.user.id;

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
    try {
      const whereConditions = [eq(chat.userId, userId)];
      if (timeFilter) whereConditions.push(timeFilter);

      if (cursor) {
        const [refChat] = await db
          .select()
          .from(chat)
          .where(eq(chat.id, cursor))
          .limit(1);

        if (!refChat) {
          return new Response("Chat not found", { status: 404 });
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

      return json({
        chats: items,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1].id : null,
      });
    } catch (err) {
      console.error("GET /api/chat/history error:", err);
      return new Response("Failed to fetch chats", { status: 500 });
    }
  },
});
