import { db } from "@/db";
import { chatbot, member, organization, question } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const createQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const deleteQuestionSchema = z.object({
  id: z.string(),
});

export const ServerRoute = createServerFileRoute("/api/questions").methods({
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
      .from(question)
      .where(
        and(eq(question.userId, userId), eq(question.chatbotId, chatbotId)),
      );

    return json(results);
  },

  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const [newQuestion] = await db
      .insert(question)
      .values({
        userId,
        organizationId,
        ...parsed.data,
      })
      .returning();

    if (newQuestion) {
      await db
        .update(organization)
        .set({
          sourcesCount: sql`${organization.sourcesCount} + 1`,
        })
        .where(eq(organization.id, organizationId));
    }

    return json(newQuestion);
  },

  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id } = parsed.data;

    const [deletedQuestion] = await db
      .delete(question)
      .where(
        and(
          eq(question.id, id),
          eq(question.userId, userId),
          eq(question.organizationId, organizationId),
        ),
      )
      .returning();

    if (!deletedQuestion) {
      return json({ error: "Question not found" }, { status: 404 });
    }

    if (deletedQuestion) {
      await db
        .update(organization)
        .set({
          sourcesCount: sql`greatest(0, ${organization.sourcesCount} - 1)`,
        })
        .where(eq(organization.id, organizationId));
    }

    return json(deletedQuestion);
  },
});
