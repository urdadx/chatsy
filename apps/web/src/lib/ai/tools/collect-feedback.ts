import { tool } from "ai";
import z from "zod";

export const collectFeedbackTool = tool({
  description: "Collects feedback from users using a form.",
  parameters: z.object({
    email: z.string().describe("The email of the user giving feedback"),
    subject: z.string().nullable().describe("The subject of the feedback"),
    message: z.string().describe("The feedback message from the user"),
  }),
  execute: async ({ email, subject, message }) => {
    console.log(
      `Feedback received from ${email} with subject "${subject}": ${message}`,
    );

    // Return a result to indicate successful feedback collection
    return {
      success: true,
      message: "Feedback collected successfully",
      feedback: {
        email,
        subject: subject || "No subject",
        message,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
