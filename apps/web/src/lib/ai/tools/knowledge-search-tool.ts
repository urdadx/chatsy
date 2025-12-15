import { searchKnowledge } from "@/lib/ai/search";
import { tool } from "ai";
import z from "zod";

export const knowledgeSearchTool = (chatbotId: string) =>
  tool({
    description:
      "Search the knowledge base for relevant information. ALWAYS use this tool FIRST before attempting to answer any question about the company, products, services, or policies. Search with key terms from the user's question.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query to find relevant information. Use key terms and phrases from the user's question.",
        ),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Number of results to return"),
    }),
    execute: async ({ query, limit = 5 }) => {
      console.log(`\n🔍 [KNOWLEDGE TOOL] Query: "${query}"`);
      console.log(`📋 [KNOWLEDGE TOOL] Chatbot ID: ${chatbotId}`);

      try {
        const results = await searchKnowledge(query, chatbotId, limit);

        if (results.length === 0) {
          console.log("⚠️ [KNOWLEDGE TOOL] No results found");
          return {
            found: false,
            message:
              "No relevant information found in the knowledge base for this query.",
            results: [],
            suggestion: "Try rephrasing the query or using different keywords.",
          };
        }

        console.log(`✅ [KNOWLEDGE TOOL] Found ${results.length} results`);

        // Format results for the AI to use
        const formattedResults = results.map((r) => {
          const result: any = {
            relevance: `${(Number(r.similarity) * 100).toFixed(1)}%`,
            content: r.content,
            source: r.source,
          };

          // Include answer for Q&A type
          if (
            r.source === "qna" &&
            r.metadata &&
            typeof r.metadata === "object" &&
            "answer" in r.metadata
          ) {
            result.answer = (r.metadata as { answer: string }).answer;
          }

          // Include URL for website source
          if (
            r.source === "website" &&
            r.metadata &&
            typeof r.metadata === "object" &&
            "url" in r.metadata
          ) {
            result.sourceUrl = (r.metadata as { url: string }).url;
          }

          return result;
        });

        return {
          found: true,
          totalResults: results.length,
          results: formattedResults,
        };
      } catch (error) {
        console.error("❌ [KNOWLEDGE TOOL] Error:", error);
        return {
          found: false,
          error: "Failed to search knowledge base",
          results: [],
        };
      }
    },
  });
