import { tool } from 'ai';
import { z } from 'zod';

export const escalateToHuman = tool({
  description: 'Transfers conversation to a human agent.',
  parameters: z.object({
    reason: z.string().optional().describe('The reason for escalating to a human agent'),
    customer_name: z.string().optional().describe('The name of the customer'),
    customer_id: z.string().optional().describe('The ID of the customer'),
  }),
  execute: async ({ reason, customer_name, customer_id }) => {
    console.log(`Escalating to human agent. Reason: ${reason || 'N/A'}, Customer Name: ${customer_name || 'N/A'}, Customer ID: ${customer_id || 'N/A'}`);
    return { success: true, message: 'Conversation escalated to a human agent.' };
  },
});
