import { db } from "@/db";
import { chat, chatbot, member } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const assignAgentSchema = z.object({
  chatId: z.string("Invalid chat ID"),
  memberId: z.string("Invalid member ID"),
});

export const ServerRoute = createServerFileRoute(
  "/api/chat/assign-agent",
).methods({
  POST: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      const userId = session?.user?.id;
      if (!userId) {
        return json({ error: "Unauthorized: Please log in" }, { status: 401 });
      }

      const chatbotId =
        session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

      if (!chatbotId) {
        return json(
          { error: "Unauthorized: Please log in or no active chatbot" },
          { status: 401 },
        );
      }

      const body = await request.json();
      const result = assignAgentSchema.safeParse(body);

      if (!result.success) {
        return json(
          { error: "Invalid request data", details: result.error.issues },
          { status: 400 },
        );
      }

      const { chatId, memberId } = result.data;

      const [chatbotData] = await db
        .select({
          organizationId: chatbot.organizationId,
        })
        .from(chatbot)
        .where(eq(chatbot.id, chatbotId));

      if (!chatbotData) {
        return json({ error: "Chatbot not found" }, { status: 404 });
      }

      const userMembership = await isUserMemberOfOrganization(
        userId,
        chatbotData.organizationId,
      );

      if (!userMembership) {
        return json(
          { error: "Forbidden: Not a member of this organization" },
          { status: 403 },
        );
      }

      // Verify the target member exists and is part of the same organization
      const [targetMember] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.id, memberId),
            eq(member.organizationId, chatbotData.organizationId),
          ),
        );

      if (!targetMember) {
        return json(
          { error: "Target member not found or not in the same organization" },
          { status: 404 },
        );
      }

      const [chatData] = await db
        .select()
        .from(chat)
        .where(and(eq(chat.id, chatId), eq(chat.chatbotId, chatbotId)));

      if (!chatData) {
        return json(
          { error: "Chat not found or doesn't belong to your chatbot" },
          { status: 404 },
        );
      }

      const [updatedChat] = await db
        .update(chat)
        .set({
          agentAssigned: memberId,
          status: "escalated", // auto escalate
        })
        .where(eq(chat.id, chatId))
        .returning();

      return json({
        success: true,
        message: "Agent assigned successfully",
        chat: updatedChat,
      });
    } catch (error) {
      console.error("Error assigning agent:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
