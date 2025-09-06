import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { db } from "@/db";
import { chat, member, message } from "@/db/schema";
import {
  getChatbotDataByPlatformIdentifier,
  getMessagesByChatId,
  saveMessages,
} from "@/lib/ai/chat-functions";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import { getActiveTools } from "@/lib/ai/get-active-tools";
import { google } from "@/lib/ai/providers";
import { systemPrompt } from "@/lib/ai/system-prompt";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback";
import { collectLeadsTool } from "@/lib/ai/tools/collect-leads";
import { escalateToHumanTool } from "@/lib/ai/tools/escalate-to-human-tool";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { ChatSDKError } from "@/lib/errors";
import { generateUUID } from "@/lib/utils";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import {
  JsonToSseTransformStream,
  convertToModelMessages,
  createUIMessageStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { polarClient } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/embed/chat/$platformIdentifier",
).methods((api) => ({
  POST: api.handler(async ({ params, request }) => {
    const { platformIdentifier } = params;

    if (!platformIdentifier) {
      const error = new ChatSDKError(
        "bad_request:api",
        "Embed token is required",
      );
      return error.toResponse();
    }

    try {
      const { id, messages } = await request.json();

      const chatbotData =
        await getChatbotDataByPlatformIdentifier(platformIdentifier);

      if (!chatbotData) {
        const error = new ChatSDKError("not_found:api", "Chatbot not found");
        return error.toResponse();
      }

      if (!chatbotData.isEmbeddingEnabled) {
        const error = new ChatSDKError(
          "forbidden:api",
          "This chatbot is offline",
        );
        return error.toResponse();
      }

      const [owner] = await db
        .select({ userId: member.userId })
        .from(member)
        .where(
          and(
            eq(member.organizationId, chatbotData.organizationId),
            eq(member.role, "owner"),
          ),
        );

      if (!owner) {
        const error = new ChatSDKError(
          "not_found:api",
          "No owner found for this organization",
        );
        return error.toResponse();
      }

      const externalCustomerId = owner.userId;

      const referer = request.headers.get("referer");
      if (chatbotData.allowedDomains && chatbotData.allowedDomains.length > 0) {
        const requestDomain = referer ? new URL(referer).hostname : null;

        if (
          !requestDomain ||
          !chatbotData.allowedDomains.some(
            (domain) =>
              requestDomain === domain || requestDomain.endsWith(`.${domain}`),
          )
        ) {
          const error = new ChatSDKError("forbidden:api", "Domain not allowed");
          return error.toResponse();
        }
      }

      const [existingChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, id));

      const userMessage = messages[messages.length - 1];

      if (!existingChat) {
        const title = await generateTitleFromUserMessage({
          message: userMessage,
        });
        await db
          .insert(chat)
          .values({
            id,
            createdAt: new Date(),
            userId: null,
            chatbotId: chatbotData.id,
            title,
            visibility: "public",
          })
          .onConflictDoNothing();
      }

      const messagesFromDb = await getMessagesByChatId({ id });
      const uiMessages = [...convertToUIMessages(messagesFromDb), userMessage];

      if (userMessage && userMessage?.role === "user") {
        try {
          await db
            .insert(message)
            .values({
              chatId: id,
              role: "user",
              parts: userMessage.parts,
            })
            .onConflictDoNothing();
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }

      const activeTools = await getActiveTools();

      const stream = createUIMessageStream({
        execute: ({ writer: dataStream }) => {
          const result = streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt(chatbotData.name ?? "Assistant", activeTools),
            messages: convertToModelMessages(uiMessages, {
              ignoreIncompleteToolCalls: true,
            }),
            stopWhen: stepCountIs(5),
            experimental_activeTools: activeTools,
            experimental_transform: smoothStream({ chunking: "word" }),
            tools: {
              knowledge_base: knowledgeSearchTool(chatbotData.id),
              collect_feedback: collectFeedbackTool,
              collect_leads: collectLeadsTool,
              escalate_to_human: escalateToHumanTool({
                chatId: id,
                chatbotId: chatbotData.id,
                organizationId: chatbotData.organizationId,
              }),
            },
            onFinish: async ({ usage }) => {
              await polarClient.events.ingest({
                events: [
                  {
                    name: "ai_usage_two",
                    externalCustomerId,
                    metadata: {
                      totalTokens: usage.totalTokens ?? 0,
                      promptTokens: usage.inputTokens ?? 0,
                      completionTokens: usage.outputTokens ?? 0,
                    },
                  },
                ],
              });
            },
            onError: (err) => {
              console.error("🛑 streamText error:", err);
            },
          });

          result.consumeStream();

          dataStream.merge(
            result.toUIMessageStream({
              sendReasoning: false,
            }),
          );
        },
        generateId: generateUUID,
        onFinish: async ({ messages }) => {
          await saveMessages({
            messages: messages.map((message) => ({
              id: message.id,
              chatId: id,
              role: message.role,
              parts: message.parts,
              createdAt: new Date(),
            })),
          });
        },
      });

      const response = new Response(
        stream.pipeThrough(new JsonToSseTransformStream()),
      );

      // Add CORS headers for embedded widgets
      const headers = new Headers(response.headers);
      headers.set("X-Chat-Id", id);
      headers.set("Cache-Control", "no-cache");
      headers.set("Connection", "keep-alive");
      headers.set("Content-Type", "text/event-stream");

      headers.set(
        "Access-Control-Allow-Origin",
        referer ? new URL(referer).origin : "*",
      );
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (err: any) {
      console.error("Error in /api/embed/chat:", err);
      return json(
        { error: err?.message || "Internal server error" },
        { status: err?.code === "DAILY_LIMIT_REACHED" ? 403 : 500 },
      );
    }
  }),

  OPTIONS: api.handler(async ({ request }) => {
    // Handle CORS preflight requests
    const referer = request.headers.get("referer");
    const headers = new Headers({
      "Access-Control-Allow-Origin": referer ? new URL(referer).origin : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return new Response(null, { status: 200, headers });
  }),
}));
