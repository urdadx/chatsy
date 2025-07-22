import { db } from "@/db";
import { question } from "@/db/schema";
import {
  generateAnswerEmbedding,
  generateQuestionEmbedding,
} from "@/lib/embeddings";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq, isNull, or } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/train").methods({
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

    try {
      // Find all questions without embeddings
      const questionsToTrain = await db
        .select()
        .from(question)
        .where(
          and(
            eq(question.organizationId, organizationId),
            or(
              isNull(question.questionEmbedding),
              isNull(question.answerEmbedding),
            ),
          ),
        );

      let processed = 0;

      for (const q of questionsToTrain) {
        const [questionEmbedding, answerEmbedding] = await Promise.all([
          generateQuestionEmbedding(q.question),
          generateAnswerEmbedding(q.answer),
        ]);

        await db
          .update(question)
          .set({
            questionEmbedding,
            answerEmbedding,
            updatedAt: new Date(),
          })
          .where(eq(question.id, q.id));

        processed++;
      }

      return json({
        message: "Training completed",
        processed,
        total: questionsToTrain.length,
      });
    } catch (error) {
      console.error("Training error:", error);
      return json({ error: "Training failed" }, { status: 500 });
    }
  },
});
