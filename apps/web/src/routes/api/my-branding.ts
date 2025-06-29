import { db } from "@/db";
import { branding, user } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/my-branding").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [userBranding] = await db
      .select({
        id: branding.id,
        userId: branding.userId,
        name: user.username,
        image: branding.image,
        primaryColor: branding.primaryColor,
        theme: branding.theme,
        hidePoweredBy: branding.hidePoweredBy,
        createdAt: branding.createdAt,
        updatedAt: branding.updatedAt,
      })
      .from(branding)
      .innerJoin(user, eq(branding.userId, user.id))
      .where(eq(branding.userId, session.user.id));

    if (!userBranding) {
      return new Response("Not found", { status: 404 });
    }

    return json(userBranding);
  },
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    try {
      if (body.name) {
        await db
          .update(user)
          .set({ username: body.name })
          .where(eq(user.id, userId));
      }

      const brandingUpdates = {
        ...(body.image && { image: body.image }),
        ...(body.primaryColor && { primaryColor: body.primaryColor }),
        ...(body.theme && { theme: body.theme }),
        ...(typeof body.hidePoweredBy === "boolean" && {
          hidePoweredBy: body.hidePoweredBy,
        }),
        updatedAt: new Date(),
      };

      const hasUpdates = Object.keys(brandingUpdates).length > 1;
      if (hasUpdates) {
        const [updated] = await db
          .update(branding)
          .set(brandingUpdates)
          .where(eq(branding.userId, userId))
          .returning();

        if (!updated) {
          return new Response("Branding not found", { status: 404 });
        }
      }

      const [brandingData] = await db
        .select({
          id: branding.id,
          userId: branding.userId,
          name: user.username,
          image: branding.image,
          primaryColor: branding.primaryColor,
          theme: branding.theme,
          hidePoweredBy: branding.hidePoweredBy,
          createdAt: branding.createdAt,
          updatedAt: branding.updatedAt,
        })
        .from(branding)
        .innerJoin(user, eq(branding.userId, user.id))
        .where(eq(branding.userId, userId));

      if (!brandingData) {
        return new Response("Branding not found", { status: 404 });
      }

      return json(brandingData);
    } catch (err) {
      console.error("PATCH /api/my-branding error:", err);
      return new Response("Failed to update branding", { status: 500 });
    }
  },
});
