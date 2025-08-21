import { db } from "@/db";
import { chat } from "@/db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";
import z from "zod";

interface EscalateToHumanContext {
  chatId: string;
  chatbotId: string;
  embedToken?: string;
}

export const escalateToHumanTool = (context: EscalateToHumanContext) =>
  tool({
    description:
      "Transfers conversation to a human agent when the AI cannot resolve the issue or when specifically requested by the customer.",
    inputSchema: z.object({
      reason: z
        .enum([
          "complex-issue",
          "customer-request",
          "technical-problem",
          "billing",
          "other",
        ])
        .describe("Reason for escalating to a human agent")
        .optional()
        .default("complex-issue"),
    }),
    execute: async ({ reason }) => {
      try {
        const [updatedChat] = await db
          .update(chat)
          .set({
            status: "escalated",
          })
          .where(eq(chat.id, context.chatId))
          .returning();

        if (!updatedChat) {
          throw new Error("Failed to update chat status");
        }

        // Here you could add additional logic like:
        // - Creating a support ticket
        // - Sending notifications to human agents
        // - Logging the escalation details
        console.log("Chat escalated to human:", {
          chatId: context.chatId,
          chatbotId: context.chatbotId,
          reason,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          reason,
          message:
            "I've escalated your conversation to a human agent. They will be with you shortly to assist with your request.",
          chatStatus: updatedChat.status,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Failed to escalate to human:", error);

        return {
          success: false,
          reason,
          message:
            "I attempted to escalate your conversation to a human agent, but there was a technical issue. Our team has been notified and will reach out to you shortly.",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        };
      }
    },
  });
