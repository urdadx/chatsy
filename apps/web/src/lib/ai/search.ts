import { db } from "@/db";
import { knowledge } from "@/db/schema";
import { sql } from "drizzle-orm";
import { generateQuestionEmbedding } from "./embeddings";

export async function searchKnowledge(
  query: string,
  chatbotId: string,
  limit = 10,
  threshold = 0.5,
) {
  const queryEmbedding = await generateQuestionEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const similarity = sql<number>`1 - (${knowledge.embedding} <=> ${embeddingString}::vector)`;

  const results = await db
    .select({
      id: knowledge.id,
      content: knowledge.content,
      source: knowledge.source,
      sourceId: knowledge.sourceId,
      metadata: knowledge.metadata,
      similarity: similarity,
    })
    .from(knowledge)
    .where(
      sql`${knowledge.chatbotId} = ${chatbotId} AND ${similarity} > ${threshold}`,
    )
    .orderBy(sql`${knowledge.embedding} <=> ${embeddingString}::vector`)
    .limit(limit);

  return results;
}
