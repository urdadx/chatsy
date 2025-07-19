import { tool } from 'ai';
import { z } from 'zod';

export const feedbackForm = tool({
  description: 'Collects feedback from users using a form.',
  parameters: z.object({
    name: z.string().describe('The name of the user giving feedback'),
    email: z.string().email().describe('The email of the user giving feedback'),
    message: z.string().describe('The feedback message from the user'),
  }),
  execute: async ({ name, email, message }) => {
    // Here you would typically send the feedback to your backend
    // For example, by making a fetch request to an API endpoint
    console.log(`Feedback received from ${name} (${email}): ${message}`);
    return { success: true, message: 'Feedback received successfully.' };
  },
});
