import { db } from "@/db";
import {
  chatbot,
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
} from "@/lib/ai/document-chunking";
import {
  generateAnswerEmbedding,
  generateQuestionEmbedding,
} from "@/lib/ai/embeddings";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { subscriptionMiddleware } from "@/middlewares";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";

export const ServerRoute = createServerFileRoute("/api/train-agent").methods(
  (api) => ({
    POST: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request, context }) => {
        const session = await auth.api.getSession({
          headers: request.headers || new Headers(),
        });
        const userId = session?.user?.id;
        if (!userId) {
          return json(
            { error: "Unauthorized: Please log in" },
            { status: 401 },
          );
        }

        if (context.hasActiveSubscription === false) {
          return json(
            { error: "Active subscription required" },
            { status: 403 },
          );
        }

        const chatbotId =
          session?.session?.activeChatbotId ||
          (await getActiveChatbotId(userId));

        if (!chatbotId) {
          return json(
            { error: "Authentication or active chatbot context is missing." },
            { status: 400 },
          );
        }

        const [chatbotData] = await db
          .select({
            id: chatbot.id,
            lastTrainedAt: chatbot.lastTrainedAt,
          })
          .from(chatbot)
          .innerJoin(organization, eq(chatbot.organizationId, organization.id))
          .where(eq(chatbot.id, chatbotId));

        if (!chatbotData) {
          return json({ error: "Chatbot not found." }, { status: 404 });
        }

        try {
          console.log(`\n🚀 Starting training for chatbot: ${chatbotId}`);

          await db
            .update(chatbot)
            .set({ trainingStatus: "in-progress" })
            .where(eq(chatbot.id, chatbotData.id));

          // ALWAYS delete all existing knowledge and retrain everything
          // This ensures consistency and avoids orphaned embeddings
          console.log("🗑️ Clearing existing knowledge base...");
          await db.delete(knowledge).where(eq(knowledge.chatbotId, chatbotId));

          let totalChunksCreated = 0;

          // ============ PROCESS DOCUMENTS ============
          const documents = await db
            .select()
            .from(documentSource)
            .where(eq(documentSource.chatbotId, chatbotId));

          console.log(`\n📄 Processing ${documents.length} documents`);

          for (const doc of documents) {
            console.log(`  📁 Document: ${doc.name} (${doc.type})`);

            try {
              const text = await extractTextFromDocument(doc.url, doc.type);

              if (!text || text.trim().length === 0) {
                console.error("  ⚠️ No text extracted from document");
                continue;
              }

              console.log(`  📝 Extracted ${text.length} characters`);

              const chunks = chunkDocument(text);
              console.log(`  ✂️ Created ${chunks.length} chunks`);

              for (let i = 0; i < chunks.length; i++) {
                const embedding = await generateAnswerEmbedding(chunks[i]);
                const cleanContent = chunks[i].replace(/\0/g, "");
                const embeddingString = `[${embedding.join(",")}]`;

                await db.insert(knowledge).values({
                  userId,
                  chatbotId,
                  source: "document",
                  sourceId: doc.id,
                  content: cleanContent,
                  embedding: sql`${embeddingString}::vector`,
                  metadata: { chunkIndex: i, documentName: doc.name },
                });
                totalChunksCreated++;
              }
              console.log("  ✅ Trained successfully");
            } catch (docError) {
              console.error("  ❌ Error:", docError);
            }
          }

          // ============ PROCESS Q&A PAIRS ============
          const questions = await db
            .select()
            .from(question)
            .where(eq(question.chatbotId, chatbotId));

          console.log(`\n❓ Processing ${questions.length} Q&A pairs`);

          for (const q of questions) {
            console.log(`  💬 Q: "${q.question.substring(0, 40)}..."`);

            try {
              const questionEmbedding = await generateQuestionEmbedding(
                q.question,
              );
              const cleanQuestion = q.question.replace(/\0/g, "");
              const embeddingString = `[${questionEmbedding.join(",")}]`;

              await db.insert(knowledge).values({
                userId,
                chatbotId,
                source: "qna",
                sourceId: q.id,
                content: cleanQuestion,
                embedding: sql`${embeddingString}::vector`,
                metadata: { answer: q.answer },
              });
              totalChunksCreated++;
              console.log("  ✅ Trained successfully");
            } catch (qError) {
              console.error("  ❌ Error:", qError);
            }
          }

          // ============ PROCESS TEXT SOURCES ============
          const texts = await db
            .select()
            .from(textSource)
            .where(eq(textSource.chatbotId, chatbotId));

          console.log(`\n📝 Processing ${texts.length} text sources`);

          for (const t of texts) {
            console.log(`  📄 Text: "${t.title}"`);

            try {
              const chunks = chunkDocument(t.content);
              console.log(`  ✂️ Created ${chunks.length} chunks`);

              for (let i = 0; i < chunks.length; i++) {
                const embedding = await generateAnswerEmbedding(chunks[i]);
                const cleanContent = chunks[i].replace(/\0/g, "");
                const embeddingString = `[${embedding.join(",")}]`;

                await db.insert(knowledge).values({
                  userId,
                  chatbotId,
                  source: "text",
                  sourceId: t.id,
                  content: cleanContent,
                  embedding: sql`${embeddingString}::vector`,
                  metadata: { chunkIndex: i, title: t.title },
                });
                totalChunksCreated++;
              }
              console.log("  ✅ Trained successfully");
            } catch (tError) {
              console.error("  ❌ Error:", tError);
            }
          }

          // ============ PROCESS WEBSITE SOURCES ============
          const websites = await db
            .select()
            .from(websiteSource)
            .where(eq(websiteSource.chatbotId, chatbotId));

          console.log(`\n🌐 Processing ${websites.length} website sources`);

          for (const w of websites) {
            console.log(`  🔗 Website: ${w.url}`);

            try {
              if (!w.markdown || w.markdown.trim().length === 0) {
                console.log("  ⚠️ No markdown content for website");
                continue;
              }

              const chunks = chunkDocument(w.markdown);
              console.log(
                `  ✂️ Created ${chunks.length} chunks from ${w.markdown.length} chars`,
              );

              for (let i = 0; i < chunks.length; i++) {
                const embedding = await generateAnswerEmbedding(chunks[i]);
                const cleanContent = chunks[i].replace(/\0/g, "");
                const embeddingString = `[${embedding.join(",")}]`;

                await db.insert(knowledge).values({
                  userId,
                  chatbotId,
                  source: "website",
                  sourceId: w.id,
                  content: cleanContent,
                  embedding: sql`${embeddingString}::vector`,
                  metadata: { chunkIndex: i, url: w.url },
                });
                totalChunksCreated++;
              }
              console.log("  ✅ Trained successfully");
            } catch (wError) {
              console.error("  ❌ Error:", wError);
            }
          }

          // Update chatbot status
          await db
            .update(chatbot)
            .set({
              trainingStatus: "completed",
              lastTrainedAt: new Date(),
            })
            .where(eq(chatbot.id, chatbotData.id));

          // Verify knowledge was stored
          const [verifyCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(knowledge)
            .where(eq(knowledge.chatbotId, chatbotId));

          console.log("\n🎉 Training complete!");
          console.log(
            `📊 Total knowledge chunks created: ${totalChunksCreated}`,
          );
          console.log(
            `✅ Verified ${verifyCount?.count || 0} entries in knowledge base`,
          );

          return json({
            message: "Agent training completed successfully.",
            stats: {
              documents: documents.length,
              questions: questions.length,
              texts: texts.length,
              websites: websites.length,
              totalChunks: totalChunksCreated,
              verifiedEntries: Number(verifyCount?.count || 0),
            },
          });
        } catch (error) {
          await db
            .update(chatbot)
            .set({ trainingStatus: "failed" })
            .where(eq(chatbot.id, chatbotData.id));
          console.error("Agent training error:", error);
          return json({ error: "Agent training failed." }, { status: 500 });
        }
      }),
  }),
);
