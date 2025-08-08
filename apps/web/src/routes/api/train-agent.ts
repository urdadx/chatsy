import { db } from "@/db";
import {
  chatbot,
  documentSource,
  knowledge,
  member,
  organization,
  question,
  textSource,
  websiteSource,
} from "@/db/schema";
import {
  chunkDocument,
  extractTextFromDocument,
} from "@/lib/ai/document-chunking";
import {
  generateAnswerEmbedding,
  generateQuestionEmbedding,
} from "@/lib/ai/embeddings";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq, gt, or } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/train-agent").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const chatbotId = session?.session?.activeChatbotId;
    const userId = session?.user?.id;

    if (!chatbotId || !userId) {
      return json(
        { error: "Authentication or active chatbot context is missing." },
        { status: 400 },
      );
    }

    // Verify the chatbot exists and get its organization
    const [chatbotData] = await db
      .select({
        organizationId: chatbot.organizationId,
        lastTrainedAt: organization.lastTrainedAt,
      })
      .from(chatbot)
      .innerJoin(organization, eq(chatbot.organizationId, organization.id))
      .where(eq(chatbot.id, chatbotId));

    if (!chatbotData) {
      return json({ error: "Chatbot not found." }, { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, userId),
          eq(member.organizationId, chatbotData.organizationId),
        ),
      );

    if (!membership) {
      return json({ error: "Forbidden." }, { status: 403 });
    }

    try {
      // Get the chatbot's last training timestamp from its organization
      const lastTrainedAt = chatbotData.lastTrainedAt;

      await db
        .update(organization)
        .set({ trainingStatus: "in-progress" })
        .where(eq(organization.id, chatbotData.organizationId));

      // Only retrain documents that are new or updated since last training
      const documentFilter = lastTrainedAt
        ? and(
            eq(documentSource.chatbotId, chatbotId),
            or(
              gt(documentSource.createdAt, lastTrainedAt),
              gt(documentSource.updatedAt, lastTrainedAt),
            ),
          )
        : eq(documentSource.chatbotId, chatbotId);

      const documents = await db
        .select()
        .from(documentSource)
        .where(documentFilter);
      for (const doc of documents) {
        await db
          .delete(knowledge)
          .where(
            and(
              eq(knowledge.source, "document"),
              eq(knowledge.sourceId, doc.id),
            ),
          );
        const text = await extractTextFromDocument(doc.url, doc.type);
        const chunks = await chunkDocument(text);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          try {
            await db.insert(knowledge).values({
              userId,
              chatbotId,
              source: "document",
              sourceId: doc.id,
              content: chunks[i],
              embedding,
              metadata: { chunkIndex: i },
            });
          } catch (insertError) {
            console.error(
              `Failed to insert knowledge for document ${doc.id}, chunk ${i}:`,
              insertError,
            );
            console.error("Data being inserted:", {
              source: "document",
              sourceId: doc.id,
              organizationId,
              userId,
              content: `${chunks[i].substring(0, 100)}...`,
              embedding: embedding ? `[${embedding.length} dimensions]` : null,
              metadata: { chunkIndex: i },
            });
            throw insertError;
          }
        }
      }

      // Only retrain questions that are new or updated since last training
      const questionFilter = lastTrainedAt
        ? and(
            eq(question.chatbotId, chatbotId),
            or(
              gt(question.createdAt, lastTrainedAt),
              gt(question.updatedAt, lastTrainedAt),
            ),
          )
        : eq(question.chatbotId, chatbotId);

      const questions = await db.select().from(question).where(questionFilter);
      for (const q of questions) {
        await db
          .delete(knowledge)
          .where(
            and(eq(knowledge.source, "qna"), eq(knowledge.sourceId, q.id)),
          );
        const questionEmbedding = await generateQuestionEmbedding(q.question);
        await db.insert(knowledge).values({
          userId,
          chatbotId,
          source: "qna",
          sourceId: q.id,
          content: q.question,
          embedding: questionEmbedding,
          metadata: { answer: q.answer },
        });
      }

      // Only retrain text sources that are new or updated since last training
      const textFilter = lastTrainedAt
        ? and(
            eq(textSource.chatbotId, chatbotId),
            or(
              gt(textSource.createdAt, lastTrainedAt),
              gt(textSource.updatedAt, lastTrainedAt),
            ),
          )
        : eq(textSource.chatbotId, chatbotId);

      const texts = await db.select().from(textSource).where(textFilter);
      for (const t of texts) {
        await db
          .delete(knowledge)
          .where(
            and(eq(knowledge.source, "text"), eq(knowledge.sourceId, t.id)),
          );
        const chunks = await chunkDocument(t.content);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          await db.insert(knowledge).values({
            userId,
            chatbotId,
            source: "text",
            sourceId: t.id,
            content: chunks[i],
            embedding,
            metadata: { chunkIndex: i },
          });
        }
      }

      // Only retrain website sources that are new or updated since last training
      const websiteFilter = lastTrainedAt
        ? and(
            eq(websiteSource.chatbotId, chatbotId),
            or(
              gt(websiteSource.createdAt, lastTrainedAt),
              gt(websiteSource.updatedAt, lastTrainedAt),
            ),
          )
        : eq(websiteSource.chatbotId, chatbotId);

      const websites = await db
        .select()
        .from(websiteSource)
        .where(websiteFilter);
      for (const w of websites) {
        await db
          .delete(knowledge)
          .where(
            and(eq(knowledge.source, "website"), eq(knowledge.sourceId, w.id)),
          );
        const chunks = await chunkDocument(w.markdown);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          await db.insert(knowledge).values({
            userId,
            chatbotId,
            source: "website",
            sourceId: w.id,
            content: chunks[i],
            embedding,
            metadata: { chunkIndex: i, url: w.url },
          });
        }
      }

      await db
        .update(organization)
        .set({
          trainingStatus: "completed",
          lastTrainedAt: new Date(),
        })
        .where(eq(organization.id, chatbotData.organizationId));

      return json({ message: "Agent training initiated successfully." });
    } catch (error) {
      await db
        .update(organization)
        .set({ trainingStatus: "failed" })
        .where(eq(organization.id, chatbotData.organizationId));
      console.error("Agent training error:", error);
      return json({ error: "Agent training failed." }, { status: 500 });
    }
  },
});
