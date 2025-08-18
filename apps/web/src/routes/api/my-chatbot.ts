import { db } from "@/db";
import { chatbot, organization, session as sessionTable } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { checkSubscriptionLimits } from "@/lib/subscription-utils";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { count, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const createChatbotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().url().optional(),
  primaryColor: z.string().default("#9333ea"),
  theme: z.enum(["light", "dark"]).default("light"),
  hidePoweredBy: z.boolean().default(false),
  initialMessage: z
    .string()
    .default("Hello there👋, how can i help you today?"),
  suggestedMessages: z.array(z.string()).optional(),
  isEmbeddingEnabled: z.boolean().default(true),
  allowedDomains: z.array(z.string()).optional(),
});

export const ServerRoute = createServerFileRoute("/api/my-chatbot").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const activeChatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!activeChatbotId) {
      return new Response("No active chatbot found", { status: 404 });
    }

    const [userChatbot] = await db.query.chatbot.findMany({
      where: (fields, { eq }) => eq(fields.id, activeChatbotId),
    });

    if (!userChatbot) {
      return new Response("Could not retrieve active chatbot data", {
        status: 404,
      });
    }

    return json(userChatbot);
  },
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const activeChatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!activeChatbotId) {
      return new Response("No active chatbot found", { status: 404 });
    }

    try {
      const body = await request.json();
      const updates = {} as Record<string, any>;
      const allowedFields = [
        "name",
        "image",
        "primaryColor",
        "theme",
        "embedToken",
        "allowedDomains",
        "suggestedMessages",
        "initialMessage",
      ];

      allowedFields.forEach((field) => {
        if (body[field] !== undefined) updates[field] = body[field];
      });

      if (typeof body.hidePoweredBy === "boolean") {
        updates.hidePoweredBy = body.hidePoweredBy;
      }
      if (typeof body.isEmbeddingEnabled === "boolean") {
        updates.isEmbeddingEnabled = body.isEmbeddingEnabled;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();

        const [updated] = await db
          .update(chatbot)
          .set(updates)
          .where(eq(chatbot.id, activeChatbotId))
          .returning();

        if (!updated) {
          return new Response("Chatbot not found", { status: 404 });
        }

        return json(updated);
      }

      const [current] = await db
        .select()
        .from(chatbot)
        .where(eq(chatbot.id, activeChatbotId));

      return current
        ? json(current)
        : new Response("Chatbot not found", { status: 404 });
    } catch (err) {
      console.error("PATCH /api/my-chatbot error:", err);
      return new Response("Failed to update chatbot", { status: 500 });
    }
  },
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    const organizationId = session?.session.activeOrganizationId;

    if (!userId || !organizationId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const isMember = await isUserMemberOfOrganization(userId, organizationId);
    if (!isMember) {
      return new Response("Forbidden", { status: 403 });
    }

    // Check subscription limits before creating chatbot
    const [currentCount] = await db
      .select({ count: count(chatbot.id) })
      .from(chatbot)
      .where(eq(chatbot.organizationId, organizationId));

    const currentChatbotCount = currentCount?.count || 0;
    const limitCheck = await checkSubscriptionLimits(
      organizationId,
      currentChatbotCount,
    );

    if (!limitCheck.canCreate) {
      return json(
        {
          error: limitCheck.message || "Chatbot creation limit reached",
          reason: limitCheck.reason,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
        },
        { status: 403 },
      );
    }

    try {
      const body = await request.json();
      const parsed = createChatbotSchema.safeParse(body);

      if (!parsed.success) {
        return json({ error: parsed.error.format() }, { status: 400 });
      }

      // Generate a unique embed token
      const embedToken = `embed_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const [newChatbot] = await db
        .insert(chatbot)
        .values({
          organizationId,
          name: parsed.data.name,
          image: parsed.data.image,
          primaryColor: parsed.data.primaryColor,
          theme: parsed.data.theme,
          hidePoweredBy: parsed.data.hidePoweredBy,
          initialMessage: parsed.data.initialMessage,
          suggestedMessages: parsed.data.suggestedMessages,
          isEmbeddingEnabled: parsed.data.isEmbeddingEnabled,
          allowedDomains: parsed.data.allowedDomains,
          embedToken: embedToken,
        })
        .returning();

      // Increment the organization's chatbot count
      await db
        .update(organization)
        .set({
          chatbotCount: sql`${organization.chatbotCount} + 1`,
        })
        .where(eq(organization.id, organizationId));

      // Update the session to set this as the active chatbot
      try {
        await db.insert(sessionTable).values({
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
          token: uuidv4(),
          userId: session.user.id || "",
          activeChatbotId: newChatbot.id,
        });
      } catch (sessionError) {
        console.warn(
          "Failed to create new session with chatbot ID:",
          sessionError,
        );
      }

      return json(newChatbot, { status: 201 });
    } catch (err) {
      console.error("POST /api/my-chatbot error:", err);
      return new Response("Failed to create chatbot", { status: 500 });
    }
  },
});
