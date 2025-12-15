import { embed } from "ai";
import { openai } from "./providers";

// Use OpenAI embeddings (kept at 768 dims to match existing vectors)
const model = openai.textEmbedding("text-embedding-3-small");

export async function generateQuestionEmbedding(text: string) {
  const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
      openai: {
        dimensions: 768,
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
      openai: {
        dimensions: 768,
      },
    },
  });
  return embedding;
}
