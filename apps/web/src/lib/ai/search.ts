import { db } from "@/db";
import { knowledge } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateQuestionEmbedding } from "./embeddings";

export async function searchKnowledge(
  query: string,
  chatbotId: string,
  limit = 10,
  threshold = 0.2,
) {
  console.log(`🔍 Searching knowledge base for chatbot: ${chatbotId}`);
  console.log(`📝 Query: "${query}"`);

  try {
    // First, check if there's any data for this chatbot
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowledge)
      .where(eq(knowledge.chatbotId, chatbotId));

    const totalKnowledgeCount = Number(countResult[0]?.count ?? 0);
    console.log(
      `📊 Total knowledge entries for chatbot: ${totalKnowledgeCount}`,
    );

    if (totalKnowledgeCount === 0) {
      console.log(`⚠️ No knowledge base entries found for chatbot ${chatbotId}`);
      return [];
    }

    const queryEmbedding = await generateQuestionEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    const cosineDistance = sql<number>`(${knowledge.embedding} <=> ${embeddingString}::vector)`;
    const similarity = sql<number>`(1 - (${knowledge.embedding} <=> ${embeddingString}::vector))`;

    const allResults = await db
      .select({
        id: knowledge.id,
        content: knowledge.content,
        source: knowledge.source,
        sourceId: knowledge.sourceId,
        metadata: knowledge.metadata,
        similarity: similarity,
      })
      .from(knowledge)
      .where(eq(knowledge.chatbotId, chatbotId))
      .orderBy(cosineDistance)
      .limit(limit);

    console.log(`📋 Raw results (before threshold): ${allResults.length}`);

    if (allResults.length > 0) {
      console.log(
        `📊 Similarity scores: ${allResults.map((r) => Number(r.similarity).toFixed(3)).join(", ")}`,
      );
      console.log(
        `📄 Top result preview: "${allResults[0].content.substring(0, 100)}..."`,
      );
    }

    // Filter by threshold after getting results (more reliable than SQL filtering)
    const filteredResults = allResults.filter(
      (r) => Number(r.similarity) >= threshold,
    );

    console.log(
      `✅ Results after threshold (${threshold}): ${filteredResults.length}`,
    );

    return filteredResults;
  } catch (error) {
    console.error("❌ Knowledge search error:", error);
    throw error;
  }
}
