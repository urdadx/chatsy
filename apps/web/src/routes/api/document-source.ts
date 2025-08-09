import { db } from "@/db";
import { chatbot, documentSource, member, organization } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const createDocumentSourceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().min(1),
  url: z.string().url(),
});

const deleteDocumentSourceSchema = z.object({
  id: z.string().uuid(),
});

export const ServerRoute = createServerFileRoute(
  "/api/document-source",
).methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const chatbotId = session?.session?.activeChatbotId;
    if (!chatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    // Verify chatbot exists and user has access to its organization
    const [chatbotData] = await db
      .select({ organizationId: chatbot.organizationId })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId))
      .limit(1);

    if (!chatbotData) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.organizationId, chatbotData.organizationId),
          eq(member.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      return json({ error: "Unauthorized: Access denied" }, { status: 403 });
    }

    const results = await db
      .select()
      .from(documentSource)
      .where(
        and(
          eq(documentSource.userId, userId),
          eq(documentSource.chatbotId, chatbotId),
        ),
      );

    return json(results);
  },

  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const chatbotId = session?.session?.activeChatbotId;
    if (!chatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    // Verify chatbot exists and user has access to its organization
    const [chatbotData] = await db
      .select({ organizationId: chatbot.organizationId })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId))
      .limit(1);

    if (!chatbotData) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.organizationId, chatbotData.organizationId),
          eq(member.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      return json({ error: "Unauthorized: Access denied" }, { status: 403 });
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
        .update(organization)
        .set({
          sourcesCount: sql`${organization.sourcesCount} + 1`,
        })
        .where(eq(organization.id, chatbotData.organizationId));
    }

    return json(newDocumentSource);
  },

  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const chatbotId = session?.session?.activeChatbotId;
    if (!chatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    // Verify chatbot exists and user has access to its organization
    const [chatbotData] = await db
      .select({ organizationId: chatbot.organizationId })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId))
      .limit(1);

    if (!chatbotData) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.organizationId, chatbotData.organizationId),
          eq(member.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
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
          eq(documentSource.userId, userId),
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
      await db
        .update(organization)
        .set({
          sourcesCount: sql`greatest(0, ${organization.sourcesCount} - 1)`,
        })
        .where(eq(organization.id, chatbotData.organizationId));
    }

    return json({ message: "Document source deleted", deleted });
  },
});
