import { db } from "@/db";
import { message } from "@/db/schema";
import type { JSONValue } from "ai";

const DEFAULT_STEP = 0;

export interface ContentPart {
  type: string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: JSONValue;
  result?: JSONValue;
  toolInvocation?: {
    state: string;
    step: number;
    toolCallId: string;
    toolName: string;
    args?: JSONValue;
    result?: JSONValue;
  };
  reasoning?: string;
  details?: JSONValue[];
}

export interface Message {
  role: "user" | "assistant" | "system" | "data" | "tool" | "tool-call";
  content: string | null | ContentPart[];
  reasoning?: string;
  attachments?: JSONValue[];
}

export async function saveFinalAssistantMessage(
  chatId: string,
  messages: Message[],
) {
  const parts: ContentPart[] = [];
  const toolMap = new Map<string, ContentPart>();
  const textParts: string[] = [];

  for (const msg of messages) {
    if (msg.role === "assistant" && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === "text") {
          textParts.push(part.text || "");
          parts.push(part);
        } else if (part.type === "tool-invocation" && part.toolInvocation) {
          const { toolCallId, state } = part.toolInvocation;
          if (!toolCallId) continue;

          const existing = toolMap.get(toolCallId);
          if (state === "result" || !existing) {
            toolMap.set(toolCallId, {
              ...part,
              toolInvocation: {
                ...part.toolInvocation,
                args: part.toolInvocation?.args || {},
              },
            });
          }
        } else if (part.type === "reasoning") {
          parts.push({
            type: "reasoning",
            reasoning: part.text || "",
            details: [
              {
                type: "text",
                text: part.text || "",
              },
            ],
          });
        } else if (part.type === "step-start") {
          parts.push(part);
        }
      }
    } else if (msg.role === "tool" && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === "tool-result") {
          const toolCallId = part.toolCallId || "";
          toolMap.set(toolCallId, {
            type: "tool-invocation",
            toolInvocation: {
              state: "result",
              step: DEFAULT_STEP,
              toolCallId,
              toolName: part.toolName || "",
              result: part.result,
            },
          });
        }
      }
    }
  }

  // Merge tool parts at the end
  parts.push(...toolMap.values());

  const finalPlainText = textParts.join("\n\n");

  try {
    await db.insert(message).values({
      chatId,
      role: "assistant",
      content: finalPlainText || "",
      parts,
    });

    console.log("Assistant message saved successfully (merged).");
  } catch (error) {
    console.error("Error saving final assistant message:", error);
    throw new Error(
      `Failed to save assistant message: ${(error as Error).message}`,
    );
  }
}
