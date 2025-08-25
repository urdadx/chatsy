import { google } from "@ai-sdk/google";
import { embed } from "ai";

const model = google.textEmbedding('gemini-embedding-001');

export async function generateQuestionEmbedding(text: string) {
  const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
        taskType: 'RETRIEVAL_QUERY',
      },
    },
  });
  return embedding;
}

export async function generateAnswerEmbedding(text: string) {
  const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
        taskType: 'RETRIEVAL_DOCUMENT',
      },
    },
  });
  return embedding;
}
