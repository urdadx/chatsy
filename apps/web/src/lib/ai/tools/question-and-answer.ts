import { searchSimilarQuestions } from "@/lib/search";
import { z } from "zod";

export const questionAndAnswer = (organizationId: string) => ({
  searchKnowledgeBase: {
    description: "Search the knowledge base for relevant questions and answers",
    parameters: z.object({
      query: z
        .string()
        .describe("The search query to find relevant information"),
      limit: z
        .number()
        .optional()
        .default(2)
        .describe("Number of results to return"),
    }),
    execute: async ({ query, limit }: { query: string; limit?: number }) => {
      const results = await searchSimilarQuestions(
        query,
        organizationId,
        limit || 2,
      );
      return {
        results: results.map((r) => ({
          question: r.question,
          answer: r.answer,
        })),
      };
    },
  },
});
