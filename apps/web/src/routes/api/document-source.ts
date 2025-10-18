import { db } from "@/db";
import { chatbot, documentSource, knowledge } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { deleteFileFromStorage } from "@/lib/hooks/delete-from-storage";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { deleteCachedData, withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const createDocumentSourceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().min(1),
  url: z.string(),
});

const deleteDocumentSourceSchema = z.object({
  id: z.string(),
});

export const ServerRoute = createServerFileRoute(
  "/api/document-source",
).methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    const organizationId = session?.session?.activeOrganizationId;

    if (!userId || !organizationId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const chatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!chatbotId) {
      return json(
        { error: "Unauthorized: No active chatbot" },
        { status: 401 },
      );
    }

    const isMember = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );

    if (!isMember) {
      return new Response("Forbidden", { status: 403 });
    }

    const results = await withCache(
      `document-sources:${chatbotId}`,
      async () => {
        return await db
          .select()
          .from(documentSource)
          .where(eq(documentSource.chatbotId, chatbotId));
      },
      { ttl: 60 },
    );

    return json(results);
  },

  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

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

    const body = await request.json();
    const parsed = createDocumentSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const [newDocumentSource] = await db
      .insert(documentSource)
      .values({
        userId,
        chatbotId,
        ...parsed.data,
      })
      .returning();

    if (newDocumentSource) {
      await db
        .update(chatbot)
        .set({
          sourcesCount: sql`${chatbot.sourcesCount} + 1`,
        })
        .where(eq(chatbot.id, chatbotId));

      // Invalidate cache
      await deleteCachedData(`document-sources:${chatbotId}`);
    }

    return json(newDocumentSource);
  },

  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const chatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!chatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }

    const [chatbotData] = await db
      .select({ organizationId: chatbot.organizationId })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId))
      .limit(1);

    if (!chatbotData) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    const isMember = await isUserMemberOfOrganization(
      userId,
      chatbotData.organizationId,
    );

    if (!isMember) {
      return json({ error: "Unauthorized: Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = deleteDocumentSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const [deleted] = await db
      .delete(documentSource)
      .where(
        and(
          eq(documentSource.id, parsed.data.id),
          eq(documentSource.chatbotId, chatbotId),
        ),
      )
      .returning();

    if (!deleted) {
      return json(
        { error: "Document source not found or unauthorized" },
        { status: 404 },
      );
    }

    if (deleted) {
      // Delete associated knowledge entries (embeddings)
      await db
        .delete(knowledge)
        .where(
          and(
            eq(knowledge.source, "document"),
            eq(knowledge.sourceId, deleted.id),
          ),
        );

      await db
        .update(chatbot)
        .set({
          sourcesCount: sql`greatest(0, ${chatbot.sourcesCount} - 1)`,
        })
        .where(eq(chatbot.id, chatbotId));
      // Delete the file from firebase storage
      try {
        await deleteFileFromStorage(deleted.url);
      } catch (error) {
        console.error("Failed to delete file from storage:", error);
      }

      // Invalidate cache
      await deleteCachedData(`document-sources:${chatbotId}`);
    }

    return json({ message: "Document source deleted", deleted });
  },
});
