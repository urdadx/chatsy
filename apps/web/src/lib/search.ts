import { db } from "@/db";
import { question } from "@/db/schema";
import { documentChunk } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateQuestionEmbedding } from "./embeddings";

export async function searchSimilarQuestions(
  query: string,
  organizationId: string,
  limit = 5,
) {
  const queryEmbedding = await generateQuestionEmbedding(query);

  // Format embedding as PostgreSQL vector string
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select({
      id: question.id,
      question: question.question,
      answer: question.answer,
      similarity: sql<number>`1 - (${question.questionEmbedding} <=> ${embeddingString}::vector)`,
    })
    .from(question)
    .where(eq(question.organizationId, organizationId))
    .orderBy(sql`${question.questionEmbedding} <=> ${embeddingString}::vector`)
    .limit(limit);

  return results;
}

export async function searchDocumentChunks(
  query: string,
  organizationId: string,
  limit = 5,
) {
  const queryEmbedding = await generateQuestionEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select({
      id: documentChunk.id,
      content: documentChunk.content,
      documentSourceId: documentChunk.documentSourceId,
      similarity: sql<number>`1 - (${documentChunk.embedding} <=> ${embeddingString}::vector)`,
    })
    .from(documentChunk)
    .where(eq(documentChunk.organizationId, organizationId))
    .orderBy(sql`${documentChunk.embedding} <=> ${embeddingString}::vector`)
    .limit(limit);

  return results;
}
