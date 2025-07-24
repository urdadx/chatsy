import { db } from "@/db";
import {
  documentSource,
  knowledge,
  organization,
  question,
  textSource,
  websiteSource,
} from "@/db/schema";
import {
  chunkDocument,
  extractTextFromDocument,
} from "@/lib/document-chunking";
import {
  generateAnswerEmbedding,
  generateQuestionEmbedding,
} from "@/lib/embeddings";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/train-agent").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    const userId = session?.user?.id;

    if (!organizationId || !userId) {
      return json(
        { error: "Authentication or organization context is missing." },
        { status: 400 },
      );
    }

    try {
      await db
        .update(organization)
        .set({ trainingStatus: "in-progress" })
        .where(eq(organization.id, organizationId));

      // Retrain Documents
      const documents = await db
        .select()
        .from(documentSource)
        .where(eq(documentSource.organizationId, organizationId));
      for (const doc of documents) {
        await db
          .delete(knowledge)
          .where(
            and(eq(knowledge.source, "document"), eq(knowledge.sourceId, doc.id)),
          );
        const text = await extractTextFromDocument(doc.url, doc.type);
        const chunks = await chunkDocument(text);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          await db.insert(knowledge).values({
            source: "document",
            sourceId: doc.id,
            organizationId,
            userId,
            content: chunks[i],
            embedding,
            metadata: { chunkIndex: i },
          });
        }
      }

      // Retrain Questions
      const questions = await db
        .select()
        .from(question)
        .where(eq(question.organizationId, organizationId));
      for (const q of questions) {
        await db
          .delete(knowledge)
          .where(and(eq(knowledge.source, "qna"), eq(knowledge.sourceId, q.id)));
        const questionEmbedding = await generateQuestionEmbedding(q.question);
        await db.insert(knowledge).values({
          source: "qna",
          sourceId: q.id,
          organizationId,
          userId,
          content: q.question,
          embedding: questionEmbedding,
          metadata: { answer: q.answer },
        });
      }

      // Retrain Text Sources
      const texts = await db
        .select()
        .from(textSource)
        .where(eq(textSource.organizationId, organizationId));
      for (const t of texts) {
        await db
          .delete(knowledge)
          .where(and(eq(knowledge.source, "text"), eq(knowledge.sourceId, t.id)));
        const chunks = await chunkDocument(t.content);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          await db.insert(knowledge).values({
            source: "text",
            sourceId: t.id,
            organizationId,
            userId,
            content: chunks[i],
            embedding,
            metadata: { chunkIndex: i },
          });
        }
      }

      // Retrain Website Sources
      const websites = await db
        .select()
        .from(websiteSource)
        .where(eq(websiteSource.organizationId, organizationId));
      for (const w of websites) {
        await db
          .delete(knowledge)
          .where(
            and(eq(knowledge.source, "website"), eq(knowledge.sourceId, w.id)),
          );
        const chunks = await chunkDocument(w.markdown); // Assuming chunkDocument works for markdown
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateAnswerEmbedding(chunks[i]);
          await db.insert(knowledge).values({
            source: "website",
            sourceId: w.id,
            organizationId,
            userId,
            content: chunks[i],
            embedding,
            metadata: { chunkIndex: i, url: w.url },
          });
        }
      }

      await db
        .update(organization)
        .set({ trainingStatus: "completed" })
        .where(eq(organization.id, organizationId));

      return json({ message: "Agent training initiated successfully." });
    } catch (error) {
      await db
        .update(organization)
        .set({ trainingStatus: "failed" })
        .where(eq(organization.id, organizationId));
      console.error("Agent training error:", error);
      return json({ error: "Agent training failed." }, { status: 500 });
    }
  },
});