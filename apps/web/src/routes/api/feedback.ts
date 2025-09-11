import { db } from "@/db";
import { chatbot, feedback } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import z from "zod";

const feedbackSchema = z.object({
  email: z.email(),
  subject: z.string().optional(),
  message: z.string().min(1),
  location: z.string().optional(),
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
      let chatbotId: string;

      if (parsed.data.embedToken) {
        // Embedded widget scenario - use embedToken to find chatbot
        const [chatbotData] = await db
          .select({
            id: chatbot.id,
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

        chatbotId = chatbotData.id;
      } else {
        // Chat preview scenario - use session to get chatbot
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeChabotId = session?.session?.activeChatbotId;
        if (!activeChabotId) {
          return json({ error: "No active chatbot" }, { status: 400 });
        }

        chatbotId = activeChabotId;
      }

      await db.insert(feedback).values({
        chatbotId: chatbotId,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        location: parsed.data.location,
      });
      return json({ success: true, message: "Feedback received" });
    } catch (error) {
      console.error("Failed to save feedback:", error);
      return json({ error: "Failed to save feedback" }, { status: 500 });
    }
  },
});
