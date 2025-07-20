import { db } from "@/db";
import { documentSource } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

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

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(documentSource)
      .where(
        and(
          eq(documentSource.userId, userId),
          eq(documentSource.organizationId, organizationId),
        ),
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
    const parsed = createDocumentSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await db.insert(documentSource).values({
      userId,
      organizationId,
      ...parsed.data,
    });

    return json({ message: "Document source created", result });
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
    const parsed = deleteDocumentSourceSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const deleted = await db
      .delete(documentSource)
      .where(
        and(
          eq(documentSource.id, parsed.data.id),
          eq(documentSource.userId, userId),
          eq(documentSource.organizationId, organizationId),
        ),
      )
      .returning();

    if (!deleted.length) {
      return json(
        { error: "Document source not found or unauthorized" },
        { status: 404 },
      );
    }

    return json({ message: "Document source deleted", deleted });
  },
});
