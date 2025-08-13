import { db } from "@/db";
import { chatbot, session as sessionTable } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const setActiveChatbotSchema = z.object({
  chatbotId: z.string().uuid("Invalid chatbot ID format"),
});

export const ServerRoute = createServerFileRoute(
  "/api/set-active-chatbot",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const parsed = setActiveChatbotSchema.safeParse(body);

      if (!parsed.success) {
        return json({ error: parsed.error.format() }, { status: 400 });
      }

      const { chatbotId } = parsed.data;
      const userId = session.user.id;

      // Verify the chatbot exists and get its organization
      const [chatbotData] = await db
        .select({
          id: chatbot.id,
          name: chatbot.name,
          organizationId: chatbot.organizationId,
        })
        .from(chatbot)
        .where(eq(chatbot.id, chatbotId));

      if (!chatbotData) {
        return json({ error: "Chatbot not found" }, { status: 404 });
      }

      const isMember = await isUserMemberOfOrganization(
        userId,
        chatbotData.organizationId,
      );

      if (!isMember) {
        return json(
          { error: "Forbidden: You don't have access to this chatbot" },
          { status: 403 },
        );
      }

      try {
        await db
          .update(sessionTable)
          .set({
            activeChatbotId: chatbotId,
            updatedAt: new Date(),
          })
          .where(eq(sessionTable.userId, userId));

        return json({
          success: true,
          message: "Active chatbot updated successfully",
          activeChatbotId: chatbotId,
          chatbotName: chatbotData.name,
        });
      } catch (error) {
        console.error("Error updating session with active chatbot:", error);
        return json(
          { error: "Failed to update active chatbot" },
          { status: 500 },
        );
      }
    } catch (err) {
      console.error("POST /api/set-active-chatbot error:", err);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
