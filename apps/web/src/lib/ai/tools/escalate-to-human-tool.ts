import { db } from "@/db";
import { chat, chatbot, member, message, user } from "@/db/schema";
import { google } from "@/lib/ai/providers";
import { resendClient } from "@/lib/emails/email";
import { generateText, tool } from "ai";
import { eq } from "drizzle-orm";
import z from "zod";
import EscalationEmail from "../tools-ui/escalation-email";

interface EscalateToHumanContext {
  chatId: string;
  chatbotId: string;
  organizationId: string;
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
        .nullable()
        .default("complex-issue"),
    }),
    execute: async ({ reason }) => {
      try {
        const organizationId = context.organizationId;

        // Fetch all messages from the chat to generate summary
        const chatMessages = await db
          .select({
            role: message.role,
            parts: message.parts,
            createdAt: message.createdAt,
          })
          .from(message)
          .where(eq(message.chatId, context.chatId))
          .orderBy(message.createdAt);

        let conversationSummary = "Customer conversation requires attention.";

        if (chatMessages.length > 0) {
          try {
            const conversationText = chatMessages
              .map((msg) => {
                const parts = msg.parts as Array<{
                  type: string;
                  text?: string;
                }>;
                const text = parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join(" ");
                return `${msg.role}: ${text}`;
              })
              .join("\n");

            const { text: summary } = await generateText({
              model: google("gemini-2.0-flash"),
              prompt: `Summarize this customer support conversation in exactly 50 words or less. Focus on the main issue and key points:\n\n${conversationText}`,
            });

            conversationSummary = summary.trim();
          } catch (summaryError) {
            console.error("Failed to generate summary:", summaryError);
            // Fallback: Use first user message
            const firstUserMsg = chatMessages.find((m) => m.role === "user");
            if (firstUserMsg) {
              const parts = firstUserMsg.parts as Array<{
                type: string;
                text?: string;
              }>;
              const text = parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join(" ");
              conversationSummary =
                text.slice(0, 200) + (text.length > 200 ? "..." : "");
            }
          }
        }

        // Fetch all members of organization from the db
        const membersWithEmails = await db
          .select({ email: user.email })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(eq(member.organizationId, organizationId));

        const emails = membersWithEmails.map((m) => m.email);

        if (emails.length === 0) {
          throw new Error("No members found for this organization");
        }

        if (emails.length > 50) {
          console.warn(
            `Organization has ${emails.length} members, exceeding Resend's limit of 50`,
          );
        }

        const [chatbotName] = await db
          .select({ name: chatbot.name })
          .from(chatbot)
          .where(eq(chatbot.id, context.chatbotId))
          .limit(1);

        const emailHtml = EscalationEmail({
          chatId: context.chatId,
          createdAt: new Date().toLocaleString(),
          reason: reason || "complex-issue",
          chatbotName: chatbotName?.name || "Chatbot",
          summary: conversationSummary,
        });

        const { error } = await resendClient.emails.send({
          from: "Padyna <escalation@padyna.com>",
          to: emails,
          subject: "🚨 Chat Escalation - Customer needs help",
          react: emailHtml,
        });

        if (error) {
          throw new Error(`Failed to send email: ${error.message}`);
        }

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

        return {
          success: true,
          reason,
          emails: emails,
          emailsSent: emails.length,
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
