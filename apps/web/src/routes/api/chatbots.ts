import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/chatbots").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
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
      return json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all chatbots for this organization
    const chatbots = await db
      .select({
        id: chatbot.id,
        name: chatbot.name,
        image: chatbot.image,
        primaryColor: chatbot.primaryColor,
        createdAt: chatbot.createdAt,
      })
      .from(chatbot)
      .where(eq(chatbot.organizationId, organizationId));

    return json({
      chatbots,
      activeChatbotId: session.session.activeChatbotId,
    });
  },
});
