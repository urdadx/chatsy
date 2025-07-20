import { tool } from 'ai';
import { z } from 'zod';

export const scheduleAppointment = tool({
  description: 'Lets customers book appointments with you.',
  parameters: z.object({
    date: z.string().describe('The desired date for the appointment (e.g., YYYY-MM-DD)'),
    time: z.string().describe('The desired time for the appointment (e.g., HH:MM AM/PM)'),
    service: z.string().optional().describe('The type of service the customer wants to book'),
    customer_name: z.string().optional().describe('The name of the customer booking the appointment'),
    customer_email: z.string().email().optional().describe('The email of the customer booking the appointment'),
  }),
  execute: async ({ date, time, service, customer_name, customer_email }) => {
    console.log(`Appointment scheduled for ${date} at ${time}. Service: ${service || 'N/A'}, Customer: ${customer_name || 'N/A'} (${customer_email || 'N/A'})`);
    return { success: true, message: 'Appointment scheduled successfully.' };
  },
});
