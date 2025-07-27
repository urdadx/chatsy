import { searchKnowledge } from "@/lib/ai/search";
import { tool } from "ai";
import z from "zod";

export const knowledgeSearchTool = (organizationId: string) =>
  tool({
    description: "Search the knowledge base for relevant information.",
    parameters: z.object({
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
      const results = await searchKnowledge(query, organizationId, limit);
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
