import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type UIMessage, generateText } from "ai";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
  const { text: title } = await generateText({
    model: google("gemini-2.5-flash"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
