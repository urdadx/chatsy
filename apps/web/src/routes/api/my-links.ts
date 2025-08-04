// import { db } from "@/db";
// import { socialLink } from "@/db/schema";
// import { json } from "@tanstack/react-start";
// import { createServerFileRoute } from "@tanstack/react-start/server";
// import { auth } from "auth";
// import { and, eq } from "drizzle-orm";
// import z  from "zod";

// const createLinkSchema = z.object({
//   platform: z.string().min(1),
//   url: z.string().url(),
//   description: z.string().optional(),
//   isConnected: z.boolean().default(true),
// });

// const updateLinkSchema = z.object({
//   id: z.string().uuid(),
//   platform: z.string().optional(),
//   url: z.string().optional(),
//   isConnected: z.boolean().optional(),
// });

// const deleteLinkSchema = z.object({
//   id: z.string().uuid(),
// });

// export const ServerRoute = createServerFileRoute("/api/my-links").methods({
//   GET: async ({ request }) => {
//     const session = await auth.api.getSession({ headers: request.headers });
//     const userId = session?.user?.id;

//     if (!userId) {
//       return json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const links = await db
//       .select()
//       .from(socialLink)
//       .where(eq(socialLink.userId, userId));

//     return json({ links });
//   },

//   POST: async ({ request }) => {
//     const session = await auth.api.getSession({ headers: request.headers });
//     const userId = session?.user?.id;

//     if (!userId) {
//       return json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const parsed = createLinkSchema.safeParse(body);

//     if (!parsed.success) {
//       return json({ error: parsed.error.format() }, { status: 400 });
//     }

//     const { platform, url, description } = parsed.data;

//     const result = await db.insert(socialLink).values({
//       userId,
//       platform,
//       url,
//       description,
//     });

//     return json({ message: "Link added", result });
//   },

//   PATCH: async ({ request }) => {
//     const session = await auth.api.getSession({ headers: request.headers });
//     const userId = session?.user?.id;

//     if (!userId) {
//       return json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const parsed = updateLinkSchema.safeParse(body);

//     if (!parsed.success) {
//       return json({ error: parsed.error.format() }, { status: 400 });
//     }

//     const { id, ...updates } = parsed.data;

//     const result = await db
//       .update(socialLink)
//       .set({ ...updates, updatedAt: new Date() })
//       .where(and(eq(socialLink.id, id), eq(socialLink.userId, userId)))
//       .returning();

//     return json({ message: "Link updated", result });
//   },

//   DELETE: async ({ request }) => {
//     const session = await auth.api.getSession({ headers: request.headers });
//     const userId = session?.user?.id;

//     if (!userId) {
//       return json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const parsed = deleteLinkSchema.safeParse(body);

//     if (!parsed.success) {
//       return json({ error: parsed.error.format() }, { status: 400 });
//     }

//     const result = await db
//       .delete(socialLink)
//       .where(
//         and(eq(socialLink.id, parsed.data.id), eq(socialLink.userId, userId)),
//       )
//       .returning();

//     return json({ message: "Link deleted", result });
//   },
// });
