import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const setActiveChatbotSchema = z.object({
  chatbotId: z.string().uuid(),
});

export const ServerRoute = createServerFileRoute(
  "/api/set-active-chatbot",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const parsed = setActiveChatbotSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { chatbotId } = parsed.data;

    // Verify the chatbot exists and get its organization
    const [chatbotData] = await db
      .select({
        organizationId: chatbot.organizationId,
      })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId));

    if (!chatbotData) {
      return json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, chatbotData.organizationId),
        ),
      );

    if (!membership) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the session with the new active chatbot
    try {
      await auth.api.updateSession({
        sessionId: session.session.id,
        update: {
          activeChatbotId: chatbotId,
          activeOrganizationId: chatbotData.organizationId,
        },
      });

      return json({ success: true, activeChatbotId: chatbotId });
    } catch (error) {
      console.error("Error updating session:", error);
      return json({ error: "Failed to set active chatbot" }, { status: 500 });
    }
  },
});
