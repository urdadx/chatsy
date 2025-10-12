import type { DBMessage } from "@/db/schema";
import type { ChatMessage } from "@/lib/types";
import { formatISO } from "date-fns";

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: (message.role === "human" ? "assistant" : message.role) as
      | "user"
      | "assistant"
      | "system",
    // @ts-ignore
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
      // Store original role so we can identify human messages
      originalRole: message.role,
    },
  }));
}
