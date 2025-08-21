import { tool } from "ai";
import z from "zod";

export const collectLeadsTool = tool({
  description: "Capture leads from conversations with customers.",
  inputSchema: z.object({
    name: z.string().describe("The name of the lead"),
    contact: z
      .string()
      .describe("The contact information of the lead (email, phone, or other)"),
    message: z.string().optional().describe("Any message from the lead"),
  }),
});
