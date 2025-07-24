import { tool } from "ai";
import z from "zod";

export const scheduleAppointmentTool = tool({
  description: "Let customers book appointments",
  parameters: z.object({
    customerName: z.string().describe("Customer name"),
    customerEmail: z.string().describe("Customer email"),
    preferredDate: z.string().describe("Preferred date in YYYY-MM-DD format"),
    preferredTime: z.string().describe("Preferred time in HH:MM format"),
  }),
  execute: async ({
    customerName,
    customerEmail,
    preferredDate,
    preferredTime,
  }) => {
    console.log(
      `Appointment scheduled for ${customerName} (${customerEmail})  on ${preferredDate} at ${preferredTime}`,
    );
  },
});
