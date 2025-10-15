import { db } from "@/db";
import { textSource } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const createTextSourceSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const updateTextSourceSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
});

const deleteTextSourceSchema = z.object({
  id: z.string().uuid(),
});

export const ServerRoute = createServerFileRoute("/api/text-sources").methods({
  GET: async ({ request }) => {
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

    const results = await db
      .select()
      .from(textSource)
      .where(eq(textSource.chatbotId, chatbotId));

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
    const parsed = createTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const [result] = await db
      .insert(textSource)
      .values({
        userId,
        ...parsed.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        chatbotId,
      })
      .returning();

    return json({ message: "Text source created", result });
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
    const parsed = updateTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    const updated = await db
      .update(textSource)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(textSource.id, id), eq(textSource.chatbotId, chatbotId)))
      .returning();

    if (!updated.length) {
      return json(
        { error: "Text source not found or unauthorized" },
        { status: 404 },
      );
    }

    return json({ message: "Text source updated", updated });
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

    const body = await request.json();
    const parsed = deleteTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const deleted = await db
      .delete(textSource)
      .where(
        and(
          eq(textSource.id, parsed.data.id),
          eq(textSource.chatbotId, chatbotId),
        ),
      )
      .returning();

    if (!deleted.length) {
      return json(
        { error: "Text source not found or unauthorized" },
        { status: 404 },
      );
    }

    return json({ message: "Text source deleted", deleted });
  },
});
