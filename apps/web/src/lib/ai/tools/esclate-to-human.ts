import { tool } from "ai";
import z from "zod";

export const escalateToHumanTool = tool({
  description: "Transfer conversation to a human agent",
  parameters: z.object({
    reason: z
      .enum([
        "complex-issue",
        "customer-request",
        "technical-problem",
        "billing",
        "other",
      ])
      .describe("Reason for escalation"),

    summary: z.string().describe("Brief summary of the conversation so far"),
    customerInfo: z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
      .optional()
      .describe("Customer information if available"),
  }),
  execute: async ({ reason, summary, customerInfo }) => {
    const escalationData = {
      reason,
      summary,
      customerInfo,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    console.log("Escalation created:", escalationData);
  },
});
