import { db } from "@/db";
import { chatbot, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/embed/generate-token",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

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

    try {
      // Generate unique embed token
      const embedToken = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

      // Update chatbot with new embed token
      const [updated] = await db
        .update(chatbot)
        .set({
          embedToken,
          updatedAt: new Date(),
        })
        .where(eq(chatbot.organizationId, organizationId))
        .returning({ embedToken: chatbot.embedToken });

      if (!updated) {
        return new Response("Chatbot not found", { status: 404 });
      }

      return json({ embedToken: updated.embedToken });
    } catch (error) {
      console.error("Error generating embed token:", error);
      return new Response("Failed to generate embed token", { status: 500 });
    }
  },
});
