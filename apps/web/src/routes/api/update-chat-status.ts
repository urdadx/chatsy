import { db } from "@/db";
import { chat, chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const updateChatStatusSchema = z.object({
  chatId: z.string("Invalid chat ID format"),
  status: z.enum(["unresolved", "resolved", "escalated"], {
    message: "Status must be unresolved, resolved, or escalated",
  }),
});

export const ServerRoute = createServerFileRoute(
  "/api/update-chat-status",
).methods({
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const parsed = updateChatStatusSchema.safeParse(body);

      if (!parsed.success) {
        return json({ error: z.treeifyError(parsed.error) }, { status: 400 });
      }

      const { chatId, status } = parsed.data;

      // Get the user's active chatbot
      const chatbotId =
        session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

      if (!chatbotId) {
        return json({ error: "No active chatbot found" }, { status: 400 });
      }

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

      const isMember = await isUserMemberOfOrganization(
        userId,
        chatbotData.organizationId,
      );
      if (!isMember) {
        return json(
          { error: "Forbidden: You do not have access to this chatbot" },
          { status: 403 },
        );
      }

      // Verify the chat belongs to the active chatbot
      const [existingChat] = await db
        .select({
          id: chat.id,
          status: chat.status,
          chatbotId: chat.chatbotId,
        })
        .from(chat)
        .where(eq(chat.id, chatId));

      if (!existingChat) {
        return json({ error: "Chat not found" }, { status: 404 });
      }

      if (existingChat.chatbotId !== chatbotId) {
        return json(
          { error: "Chat belongs to a different chatbot" },
          { status: 403 },
        );
      }

      // Update the chat status
      const [updatedChat] = await db
        .update(chat)
        .set({
          status,
        })
        .where(eq(chat.id, chatId))
        .returning({
          id: chat.id,
          status: chat.status,
          title: chat.title,
        });

      if (!updatedChat) {
        return json({ error: "Failed to update chat status" }, { status: 500 });
      }

      return json({
        success: true,
        message: `Chat status updated to ${status}`,
        chat: updatedChat,
      });
    } catch (error) {
      console.error("Error updating chat status:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
