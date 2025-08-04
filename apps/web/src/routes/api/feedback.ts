import { db } from "@/db";
import { chatbot, feedback, member } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const feedbackSchema = z.object({
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
  embedToken: z.string().min(1).optional(),
});

export const ServerRoute = createServerFileRoute("/api/feedback").methods({
  POST: async ({ request }) => {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error }, { status: 400 });
    }

    try {
      let organizationId: string;

      if (parsed.data.embedToken) {
        // Embedded widget scenario - use embedToken to find organization
        const [chatbotData] = await db
          .select({
            organizationId: chatbot.organizationId,
            isEmbeddingEnabled: chatbot.isEmbeddingEnabled,
          })
          .from(chatbot)
          .where(eq(chatbot.embedToken, parsed.data.embedToken));

        if (!chatbotData) {
          return json({ error: "Invalid embed token" }, { status: 400 });
        }

        if (!chatbotData.isEmbeddingEnabled) {
          return json(
            { error: "Embedding is not enabled for this chatbot" },
            { status: 403 },
          );
        }

        organizationId = chatbotData.organizationId;
      } else {
        // Chat preview scenario - use session to get organization
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeOrganizationId = session?.session?.activeOrganizationId;
        if (!activeOrganizationId) {
          return json({ error: "No active organization" }, { status: 400 });
        }

        // Verify user is a member of the organization
        const [membership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.userId, session.user.id),
              eq(member.organizationId, activeOrganizationId),
            ),
          );

        if (!membership) {
          return json({ error: "Forbidden" }, { status: 403 });
        }

        organizationId = activeOrganizationId;
      }

      await db.insert(feedback).values({
        organizationId,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
      return json({ success: true, message: "Feedback received" });
    } catch (error) {
      console.error("Failed to save feedback:", error);
      return json({ error: "Failed to save feedback" }, { status: 500 });
    }
  },
});
