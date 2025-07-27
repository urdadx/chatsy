import { api } from "@/lib/api";
import { tool } from "ai";
import { z } from "zod";

export const collectLeadsTool = tool({
  description: "Capture leads from conversations with customers.",
  parameters: z.object({
    name: z.string().describe("The name of the lead"),
    email: z.string().describe("The email of the lead"),
    phone: z.string().optional().describe("The phone number of the lead"),
    company: z.string().optional().describe("The company of the lead"),
    message: z.string().optional().describe("Any message from the lead"),
    location: z.string().optional().describe("The location of the lead"),
  }),
  execute: async ({ name, email, phone, company, message, location }) => {
    try {
      await api.post("/api/leads", {
        name,
        email,
        phone,
        company,
        message,
        location,
      });

      return { success: true, message: "Lead collected successfully." };
    } catch (error) {
      console.error("Failed to collect lead:", error);
      return { success: false, message: "Failed to collect lead." };
    }
  },
});
