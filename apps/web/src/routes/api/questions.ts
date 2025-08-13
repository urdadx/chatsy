import { db } from "@/db";
import { chatbot, question } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
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
      .where(
        and(
          eq(question.id, id),
          eq(question.userId, userId),
          eq(question.chatbotId, chatbotId),
        ),
      )
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
    }

    return json(deletedQuestion);
  },
});
