import { db } from "@/db";
import { product } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  image: z.string().optional(),
  price: z.string(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
  type: z.enum(["course", "merch", "downloadable"]),
});

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  url: z.string().url().optional(),
  image: z.string().optional(),
  price: z.string().optional(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
  type: z.enum(["course", "merch", "downloadable"]).optional(),
});

const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export const APIRoute = createAPIFileRoute("/api/my-products")({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(product)
      .where(eq(product.userId, userId));

    return json(results);
  },

  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await db.insert(product).values({
      ...parsed.data,
      userId,
    });

    return json({ message: "Product created", result });
  },

  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    const result = await db
      .update(product)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(product.id, id), eq(product.userId, userId)))
      .returning();

    return json({ message: "Product updated", result });
  },

  DELETE: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteProductSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const result = await db
      .delete(product)
      .where(and(eq(product.id, parsed.data.id), eq(product.userId, userId)))
      .returning();

    return json({ message: "Product deleted", result });
  },
});
