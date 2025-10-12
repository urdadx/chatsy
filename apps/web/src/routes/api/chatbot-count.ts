import { db } from "@/db";
import { chatbot } from "@/db/schema";
import { isUserMemberOfOrganization } from "@/lib/ai/chat-functions";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { count, eq } from "drizzle-orm";
import { auth } from "../../../auth";

export const ServerRoute = createServerFileRoute("/api/chatbot-count").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    const organizationId = session?.session?.activeOrganizationId;

    if (!userId || !organizationId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const isMember = await isUserMemberOfOrganization(userId, organizationId);
    if (!isMember) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      // Get current chatbot count for organization
      const [result] = await db
        .select({ count: count(chatbot.id) })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId));

      return json({
        count: result?.count || 0,
        organizationId,
      });
    } catch (error) {
      console.error("Error getting chatbot count:", error);
      return json({ error: "Failed to get chatbot count" }, { status: 500 });
    }
  },
});
