
import { searchSimilarTextSources } from "@/lib/search";
import { z } from "zod";

export const createTextSourceSearchTool = (organizationId: string) => ({
  name: "text_source_search",
  description: "Search for information in the available text sources.",
  input: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
    const results = await searchSimilarTextSources(query, organizationId);
    return {
      results,
    };
  },
});
