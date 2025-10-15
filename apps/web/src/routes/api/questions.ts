import { db } from "@/db";
import { chatbot, question } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { deleteCachedData, withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

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
      `questions:${chatbotId}`,
      async () => {
        return await db
          .select()
          .from(question)
          .where(eq(question.chatbotId, chatbotId));
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
      return json({ error: "No active chatbot" }, { status: 400 });
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
        chatbotId,
        ...parsed.data,
      })
      .returning();

    if (newQuestion) {
      await db
        .update(chatbot)
        .set({
          sourcesCount: sql`${chatbot.sourcesCount} + 1`,
        })
        .where(eq(chatbot.id, chatbotId));

      // Invalidate cache
      await deleteCachedData(`questions:${chatbotId}`);
    }

    return json(newQuestion);
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
      return json(
        { error: "Unauthorized: No active chatbot" },
        { status: 401 },
      );
    }
    const body = await request.json();
    const parsed = deleteQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id } = parsed.data;

    const [deletedQuestion] = await db
      .delete(question)
      .where(and(eq(question.id, id), eq(question.chatbotId, chatbotId)))
      .returning();

    if (!deletedQuestion) {
      return json({ error: "Question not found" }, { status: 404 });
    }

    if (deletedQuestion) {
      await db
        .update(chatbot)
        .set({
          sourcesCount: sql`greatest(0, ${chatbot.sourcesCount} - 1)`,
        })
        .where(eq(chatbot.id, chatbotId));

      // Invalidate cache
      await deleteCachedData(`questions:${chatbotId}`);
    }

    return json(deletedQuestion);
  },

  PATCH: async ({ request }) => {
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

    const body = await request.json();
    const schema = z.object({
      id: z.string(),
      question: z.string().min(1).optional(),
      answer: z.string().min(1).optional(),
    });
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, question: newQuestion, answer: newAnswer } = parsed.data;

    const [updatedQuestion] = await db
      .update(question)
      .set({
        ...(newQuestion !== undefined ? { question: newQuestion } : {}),
        ...(newAnswer !== undefined ? { answer: newAnswer } : {}),
      })
      .where(and(eq(question.id, id), eq(question.chatbotId, chatbotId)))
      .returning();

    if (!updatedQuestion) {
      return json(
        { error: "Question not found or not updated" },
        { status: 404 },
      );
    }

    // Invalidate cache
    await deleteCachedData(`questions:${chatbotId}`);

    return json(updatedQuestion);
  },
});
