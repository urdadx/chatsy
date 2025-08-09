import { db } from "@/db";
import { chatbot, lead } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import z from "zod";

const leadSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  message: z.string().optional(),
  embedToken: z.string().min(1).optional(),
});

export const ServerRoute = createServerFileRoute("/api/leads").methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const parsed = leadSchema.safeParse(body);

      if (!parsed.success) {
        return json({ error: parsed.error }, { status: 400 });
      }

      let chatbotId: string;

      if (parsed.data.embedToken) {
        // Embedded widget scenario - use embedToken to find organization
        const [chatbotData] = await db
          .select({
            chatbotId: chatbot.id,
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
        chatbotId = chatbotData.chatbotId;
      } else {
        // Chat preview scenario - use session to get organization
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeChatbotId = session?.session?.activeChatbotId;
        if (!activeChatbotId) {
          return json({ error: "No active organization" }, { status: 400 });
        }
        chatbotId = activeChatbotId;
      }

      await db.insert(lead).values({
        chatbotId: chatbotId,
        name: parsed.data.name,
        contact: parsed.data.contact,
        message: parsed.data.message,
      });
      return json({ success: true, message: "Lead collected successfully" });
    } catch (error) {
      console.error("Failed to save lead:", error);
      return json({ error: "Failed to save lead" }, { status: 500 });
    }
  },
});
