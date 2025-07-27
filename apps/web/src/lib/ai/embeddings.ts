import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type EmbeddingTaskType =
  | "RETRIEVAL_QUERY"
  | "SEMANTIC_SIMILARITY"
  | "CLASSIFICATION"
  | "CLUSTERING"
  | "RETRIEVAL_DOCUMENT"
  | "QUESTION_ANSWERING"
  | "FACT_VERIFICATION"
  | "CODE_RETRIEVAL_QUERY";

const createEmbeddingModel = (taskType: EmbeddingTaskType) =>
  google.textEmbeddingModel("text-embedding-004", {
    outputDimensionality: 768,
    taskType,
  });

export async function generateQuestionEmbedding(text: string) {
  const { embedding } = await embed({
    model: createEmbeddingModel("RETRIEVAL_QUERY"),
    value: text,
  });
  return embedding;
}

export async function generateAnswerEmbedding(text: string) {
  const { embedding } = await embed({
    model: createEmbeddingModel("RETRIEVAL_DOCUMENT"),
    value: text,
  });
  return embedding;
}
