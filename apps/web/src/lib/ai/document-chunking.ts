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

export function chunkDocument(text: string, chunkSize = 500): string[] {
  const chunks: string[] = [];

  const sentences = text
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  let currentChunk = "";
  let lastChunkEnd = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const potentialChunk = currentChunk
      ? `${currentChunk} ${sentence}`
      : sentence;

    if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      const words = currentChunk.split(" ");
      const overlapWords = Math.min(20, Math.floor(words.length / 3));
      lastChunkEnd = words.slice(-overlapWords).join(" ");

      currentChunk = `${lastChunkEnd} ${sentence}`;
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim().length > 10) {
    chunks.push(currentChunk.trim());
  }

  console.log(`📚 Chunked document into ${chunks.length} chunks`);
  return chunks.length > 0 ? chunks : [text];
}
