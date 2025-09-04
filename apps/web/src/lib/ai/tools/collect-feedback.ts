import { tool } from "ai";
import z from "zod";

export const collectFeedbackTool = tool({
  description:
    "Collect user feedback when they express satisfaction/dissatisfaction, want to leave a review, or report an experience",
  inputSchema: z.object({
    email: z
      .string()
      .nullable()
      .describe("User's email address for follow-up or confirmation"),
    subject: z
      .string()
      .nullable()
      .describe("Subject of the feedback (optional)"),
    message: z.string().describe("The feedback message from the user"),
  }),
});
