import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function extractTextFromDocument(
  url: string,
  type: string,
): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  switch (type) {
    case "application/pdf": {
      const pdfData = await pdfParse(Buffer.from(buffer));
      return pdfData.text;
    }

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const docxResult = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      return docxResult.value;
    }

    case "application/msword":
      throw new Error(".doc files not supported yet, please use .docx");

    case "text/plain":
      return Buffer.from(buffer).toString("utf-8");

    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}

// Enhanced chunking with overlap
export function chunkDocument(
  text: string,
  chunkSize = 1000,
  overlapSize = 200,
): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let currentChunk = "";
  let previousChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (
      (currentChunk + trimmedSentence).length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());

      // Add overlap from previous chunk
      const overlapWords = previousChunk.split(" ").slice(-overlapSize / 10);
      currentChunk = `${overlapWords.join(" ")} ${trimmedSentence}`;
      previousChunk = currentChunk;
    } else {
      currentChunk += `${trimmedSentence}. `;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
