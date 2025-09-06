import { db } from "@/db";
import { chat, chatbot, member, user } from "@/db/schema";
import { resendClient } from "@/lib/emails/email";
import { tool } from "ai";
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
