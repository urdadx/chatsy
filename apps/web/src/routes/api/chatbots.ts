import { db } from "@/db";
import { chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";

export const ServerRoute = createServerFileRoute("/api/chatbots").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }
    const activeChatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    const organizationId = session?.session?.activeOrganizationId;

    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const isMember = await isUserMemberOfOrganization(
      session.user.id,
      organizationId,
    );

    if (!isMember) {
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
      activeChatbotId: activeChatbotId,
    });
  },
});
