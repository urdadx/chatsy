import { db } from "@/db";
import { chatbot, knowledge } from "@/db/schema";
import { generateQuestionEmbedding } from "@/lib/ai/embeddings";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { count, eq, sql } from "drizzle-orm";
import { auth } from "../../../../auth";

/**
 * Debug endpoint to check knowledge base status
 * GET /api/debug/knowledge-status
 */
export const ServerRoute = createServerFileRoute(
  "/api/debug/knowledge-status",
).methods((api) => ({
  GET: api.handler(async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!chatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }

    try {
      const [chatbotData] = await db
        .select({
          id: chatbot.id,
          name: chatbot.name,
          lastTrainedAt: chatbot.lastTrainedAt,
        })
        .from(chatbot)
        .where(eq(chatbot.id, chatbotId));

      if (!chatbotData) {
        return json({ error: "Chatbot not found", chatbotId }, { status: 404 });
      }

      const [totalCount] = await db
        .select({ count: count() })
        .from(knowledge)
        .where(eq(knowledge.chatbotId, chatbotId));

      const sourceBreakdown = await db
        .select({
          source: knowledge.source,
          count: count(),
        })
        .from(knowledge)
        .where(eq(knowledge.chatbotId, chatbotId))
        .groupBy(knowledge.source);

      const sampleEntries = await db
        .select({
          id: knowledge.id,
          source: knowledge.source,
          content: knowledge.content,
          metadata: knowledge.metadata,
        })
        .from(knowledge)
        .where(eq(knowledge.chatbotId, chatbotId))
        .limit(5);

      const testQuery = "padyna";
      const queryEmbedding = await generateQuestionEmbedding(testQuery);
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      const similarity = sql<number>`1 - (${knowledge.embedding} <=> ${embeddingString}::vector)`;

      const searchResults = await db
        .select({
          id: knowledge.id,
          content: knowledge.content,
          source: knowledge.source,
          similarity: similarity,
        })
        .from(knowledge)
        .where(eq(knowledge.chatbotId, chatbotId))
        .orderBy(sql`${knowledge.embedding} <=> ${embeddingString}::vector`)
        .limit(5);

      return json({
        status: "ok",
        chatbot: {
          id: chatbotId,
          name: chatbotData.name,
          lastTrainedAt: chatbotData.lastTrainedAt,
        },
        knowledgeBase: {
          totalEntries: totalCount?.count ?? 0,
          bySource: sourceBreakdown,
          sampleEntries: sampleEntries.map((e) => ({
            id: e.id,
            source: e.source,
            contentPreview: `${e.content.substring(0, 200)}...`,
            metadata: e.metadata,
          })),
        },
        testSearch: {
          query: testQuery,
          resultsCount: searchResults.length,
          results: searchResults.map((r) => ({
            id: r.id,
            source: r.source,
            similarity: r.similarity,
            contentPreview: `${r.content.substring(0, 150)}...`,
          })),
        },
      });
    } catch (error: any) {
      console.error("Debug knowledge status error:", error);
      return json(
        {
          error: "Failed to check knowledge status",
          details: error.message,
          stack: error.stack,
        },
        { status: 500 },
      );
    }
  }),
}));
