import { db } from "@/db";
import { documentChunk, documentSource } from "@/db/schema";
import {
  chunkDocument,
  extractTextFromDocument,
} from "@/lib/document-chunking";

import { generateAnswerEmbedding } from "@/lib/embeddings";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const processDocumentSchema = z.object({
  documentSourceId: z.string().uuid(),
});

export const ServerRoute = createServerFileRoute(
  "/api/document-processing",
).methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = processDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      // Get the document source
      const [document] = await db
        .select()
        .from(documentSource)
        .where(
          and(
            eq(documentSource.id, parsed.data.documentSourceId),
            eq(documentSource.userId, userId),
            eq(documentSource.organizationId, organizationId),
          ),
        );

      if (!document) {
        return json({ error: "Document not found" }, { status: 404 });
      }

      // Extract text from document
      const text = await extractTextFromDocument(document.url, document.type);

      // Chunk the text
      const chunks = await chunkDocument(text);

      // Process chunks and generate embeddings
      let processedChunks = 0;

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateAnswerEmbedding(chunks[i]);

        await db.insert(documentChunk).values({
          documentSourceId: document.id,
          organizationId,
          content: chunks[i],
          embedding,
          chunkIndex: i,
          metadata: {
            startChar: text.indexOf(chunks[i]),
            endChar: text.indexOf(chunks[i]) + chunks[i].length,
          },
        });

        processedChunks++;
      }

      return json({
        message: "Document processed successfully",
        chunksCreated: processedChunks,
        totalChunks: chunks.length,
      });
    } catch (error) {
      console.error("Document processing error:", error);
      return json(
        { error: error instanceof Error ? error.message : "Processing failed" },
        { status: 500 },
      );
    }
  },
});
