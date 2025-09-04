import { searchKnowledge } from "@/lib/ai/search";
import { tool } from "ai";
import z from "zod";

export const knowledgeSearchTool = (chatbotId: string) =>
  tool({
    description:
      "Search company knowledge base for policies, procedures, technical issues, and factual information when the user asks questions you cannot answer confidently",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The search query to find relevant information."),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Number of results to return"),
    }),
    execute: async ({ query, limit = 5 }) => {
      const results = await searchKnowledge(query, chatbotId, limit);
      return {
        results: results.map((r) => ({
          content: r.content,
          source: r.source,
          sourceId: r.sourceId,
          metadata: r.metadata,
        })),
      };
    },
  });
