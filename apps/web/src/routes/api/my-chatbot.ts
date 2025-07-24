import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/my-chatbot").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's active organization from session
    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return new Response("No active organization", { status: 400 });
    }

    // Verify user is a member of the organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    const [userChatbot] = await db
      .select({
        id: chatbot.id,
        organizationId: chatbot.organizationId,
        name: chatbot.name,
        image: chatbot.image,
        primaryColor: chatbot.primaryColor,
        theme: chatbot.theme,
        hidePoweredBy: chatbot.hidePoweredBy,
        initialMessage: chatbot.initialMessage,
        suggestedMessages: chatbot.suggestedMessages,
        createdAt: chatbot.createdAt,
        updatedAt: chatbot.updatedAt,
      })
      .from(chatbot)
      .where(eq(chatbot.organizationId, organizationId));

    if (!userChatbot) {
      return new Response("Not found", { status: 404 });
    }

    return json(userChatbot);
  },
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's active organization from session
    const organizationId = session.session.activeOrganizationId;
    if (!organizationId) {
      return new Response("No active organization", { status: 400 });
    }

    // Verify user is a member of the organization (optionally check for admin/owner role)
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    // Optional: Check if user has admin/owner role for branding changes
    // if (!['admin', 'owner'].includes(membership.role)) {
    //   return new Response("Insufficient permissions", { status: 403 });
    // }

    const body = await request.json();

    try {
      const chatbotUpdates = {
        ...(body.name && { name: body.name }),
        ...(body.image && { image: body.image }),
        ...(body.primaryColor && { primaryColor: body.primaryColor }),
        ...(body.theme && { theme: body.theme }),
        ...(typeof body.hidePoweredBy === "boolean" && {
          hidePoweredBy: body.hidePoweredBy,
        }),
        ...(body.initialMessage !== undefined && {
          initialMessage: body.initialMessage,
        }),
        ...(body.suggestedMessages && {
          suggestedMessages: body.suggestedMessages,
        }),
        updatedAt: new Date(),
      };

      const hasUpdates = Object.keys(chatbotUpdates).length > 1;
      if (hasUpdates) {
        const [updated] = await db
          .update(chatbot)
          .set(chatbotUpdates)
          .where(eq(chatbot.organizationId, organizationId))
          .returning();

        if (!updated) {
          return new Response("Chatbot not found", { status: 404 });
        }
      }

      const [chatbotData] = await db
        .select({
          id: chatbot.id,
          organizationId: chatbot.organizationId,
          name: chatbot.name,
          image: chatbot.image,
          primaryColor: chatbot.primaryColor,
          theme: chatbot.theme,
          hidePoweredBy: chatbot.hidePoweredBy,
          initialMessage: chatbot.initialMessage,
          suggestedMessages: chatbot.suggestedMessages,
          createdAt: chatbot.createdAt,
          updatedAt: chatbot.updatedAt,
        })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId));

      if (!chatbotData) {
        return new Response("Chatbot not found", { status: 404 });
      }

      return json(chatbotData);
    } catch (err) {
      console.error("PATCH /api/my-branding error:", err);
      return new Response("Failed to update branding", { status: 500 });
    }
  },
});
