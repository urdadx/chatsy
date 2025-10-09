import { db } from "@/db";
import { chatbot, issueReport } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import z from "zod";

const issueReportSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  screenshot: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  location: z.string().optional(),
  embedToken: z.string().min(1).optional(),
});

export const ServerRoute = createServerFileRoute("/api/report-issue").methods({
  POST: async ({ request }) => {
    const body = await request.json();
    const parsed = issueReportSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
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
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeChatbotId = session?.session?.activeChatbotId;
        if (!activeChatbotId) {
          return json({ error: "No active chatbot" }, { status: 400 });
        }

        chatbotId = activeChatbotId;
      }

      await db.insert(issueReport).values({
        chatbotId: chatbotId,
        title: parsed.data.title,
        description: parsed.data.description,
        screenshot: parsed.data.screenshot,
        email: parsed.data.email,
        location: parsed.data.location,
      });

      return json({
        success: true,
        message: "Feature request submitted successfully",
      });
    } catch (error) {
      console.error("Failed to save feature request:", error);
      return json({ error: "Failed to save feature request" }, { status: 500 });
    }
  },
});
