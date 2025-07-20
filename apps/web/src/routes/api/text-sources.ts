
import { db } from "@/db";
import { textSource } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const createTextSourceSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const updateTextSourceSchema = z.object({
  id: z.string().uuid(),
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

    const results = await db
      .select()
      .from(textSource)
      .where(eq(textSource.userId, userId));

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
    const parsed = createTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await db.insert(textSource).values({
      userId,
      ...parsed.data,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId,
    });

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

    const body = await request.json();
    const parsed = updateTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    const updated = await db
      .update(textSource)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(textSource.id, id), eq(textSource.userId, userId)))
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

    const body = await request.json();
    const parsed = deleteTextSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const deleted = await db
      .delete(textSource)
      .where(and(eq(textSource.id, parsed.data.id), eq(textSource.userId, userId)))
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
