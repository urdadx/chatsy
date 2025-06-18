import { db } from "@/db";
import { question } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const createQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  isSuggested: z.boolean().optional(),
});

const updateQuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().optional(),
  answer: z.string().optional(),
  isSuggested: z.boolean().optional(),
});

const deleteQuestionSchema = z.object({
  id: z.string().uuid(),
});

export const APIRoute = createAPIFileRoute("/api/questions")({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(question)
      .where(eq(question.userId, userId));

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

    const body = await request.json();
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await db.insert(question).values({
      userId,
      ...parsed.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return json({ message: "Question created", result });
  },

  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    const updated = await db
      .update(question)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(question.id, id), eq(question.userId, userId)))
      .returning();

    if (!updated.length) {
      return json(
        { error: "Question not found or unauthorized" },
        { status: 404 },
      );
    }

    return json({ message: "Question updated", updated });
  },

  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const deleted = await db
      .delete(question)
      .where(and(eq(question.id, parsed.data.id), eq(question.userId, userId)))
      .returning();

    if (!deleted.length) {
      return json(
        { error: "Question not found or unauthorized" },
        { status: 404 },
      );
    }

    return json({ message: "Question deleted", deleted });
  },
});
