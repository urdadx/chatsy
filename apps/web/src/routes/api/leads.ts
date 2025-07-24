import { tool } from 'ai';
import { z } from 'zod';

export const collectLeads = tool({
  description: 'Captures leads from conversations with customers.',
  parameters: z.object({
    name: z.string().describe('The name of the lead'),
    email: z.string().email().describe('The email of the lead'),
    phone: z.string().optional().describe('The phone number of the lead'),
    company: z.string().optional().describe('The company of the lead'),
    message: z.string().optional().describe('Any message from the lead'),
  }),
  execute: async ({ name, email, phone, company, message }) => {
    console.log(`New lead collected: Name - ${name}, Email - ${email}, Phone - ${phone || 'N/A'}, Company - ${company || 'N/A'}, Message - ${message || 'N/A'}`);
    return { success: true, message: 'Lead collected successfully.' };
  },
});
