import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { db } from "@/db";
import { chatbot, message } from "@/db/schema";
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/ai/chat-functions";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import { getActiveTools } from "@/lib/ai/get-active-tools";
import { systemPrompt } from "@/lib/ai/prompts/system-prompt";
import { google } from "@/lib/ai/providers";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback";
import { collectLeadsTool } from "@/lib/ai/tools/collect-leads";
import { escalateToHumanTool } from "@/lib/ai/tools/escalate-to-human-tool";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { getCustomerExternalId } from "@/lib/subscription/subscription-functions";
import { generateUUID } from "@/lib/utils";
import { subscriptionMiddleware, tokenUsageMiddleware } from "@/middlewares";
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
import { auth, polarClient } from "auth";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/chat/").methods(
  (api) => ({
    POST: api
      .middleware([subscriptionMiddleware, tokenUsageMiddleware])
      .handler(async ({ request, context }) => {
        try {
          const { id, messages } = await request.json();

          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session) {
            const error = new ChatSDKError("unauthorized:chat");
            return error.toResponse();
          }

          const userId = session?.user.id || "";

          if (context.hasActiveSubscription === false) {
            const error = new ChatSDKError("forbidden:subscription");
            return error.toResponse();
          }

          if (context.tokensLeft === 0) {
            const error = new ChatSDKError("forbidden:tokens");
            return error.toResponse();
          }

          const chatbotId =
            session?.session?.activeChatbotId ||
            (await getActiveChatbotId(userId));

          if (!chatbotId) {
            const error = new ChatSDKError(
              "bad_request:api",
              "No active chatbot selected",
            );
            return error.toResponse();
          }

          const [chatbotData] = await db
            .select({
              organizationId: chatbot.organizationId,
              name: chatbot.name,
              personality: chatbot.personality,
            })
            .from(chatbot)
            .where(eq(chatbot.id, chatbotId));

          if (!chatbotData) {
            const error = new ChatSDKError(
              "not_found:api",
              "Chatbot not found",
            );
            return error.toResponse();
          }

          const externalCustomerId = (await getCustomerExternalId()) || "";
          const chat = await getChatById(id);

          const userMessage = messages[messages.length - 1];

          if (!chat) {
            const title = await generateTitleFromUserMessage({
              message: userMessage,
            });
            await saveChat({
              id,
              userId: session?.user.id,
              chatbotId,
              title,
              visibility: "private",
              channel: "web",
            });
          } else {
            if (chat.chatbotId !== chatbotId) {
              const error = new ChatSDKError(
                "forbidden:chat",
                "This chat belongs to a different chatbot",
              );
              return error.toResponse();
            }
          }

          const messagesFromDb = await getMessagesByChatId({ id });
          const uiMessages = [
            ...convertToUIMessages(messagesFromDb),
            userMessage,
          ];

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

          // Get chatbot details
          const activeTools = await getActiveTools();
          const chatbotName = chatbotData.name || "AI Assistant";
          const chatbotPersonality = chatbotData.personality || "support";
          const organizationId = chatbotData.organizationId;
          const chatId = id;

          const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
              const result = streamText({
                model: google("gemini-2.0-flash"),
                system: systemPrompt(
                  chatbotName,
                  activeTools,
                  chatbotPersonality,
                ),
                messages: convertToModelMessages(uiMessages, {
                  ignoreIncompleteToolCalls: true,
                }),
                experimental_activeTools: activeTools,
                stopWhen: stepCountIs(5),
                experimental_transform: smoothStream({ chunking: "word" }),
                tools: {
                  knowledge_base: knowledgeSearchTool(chatbotId),
                  collect_feedback: collectFeedbackTool,
                  collect_leads: collectLeadsTool,
                  escalate_to_human: escalateToHumanTool({
                    chatId,
                    chatbotId,
                    organizationId,
                  }),
                },
                onFinish: async ({ usage }) => {
                  await polarClient.events.ingest({
                    events: [
                      {
                        name: "llm_usage",
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

              dataStream.merge(result.toUIMessageStream());
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

          const headers = new Headers(response.headers);
          headers.set("Content-Type", "text/event-stream");

          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch (err: any) {
          console.error("Error in /api/chat:", err);
          return json(
            { error: err?.message || "Internal server error" },
            { status: err?.code === "DAILY_LIMIT_REACHED" ? 403 : 500 },
          );
        }
      }),

    DELETE: api.handler(async ({ request }) => {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
        const error = new ChatSDKError("not_found:chat", "Chat ID is required");
        return error.toResponse();
      }

      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        const error = new ChatSDKError("unauthorized:chat");
        return error.toResponse();
      }
      const userId = session?.user.id || "";

      const chatbotId =
        session?.session?.activeChatbotId || (await getActiveChatbotId(userId));
      if (!chatbotId) {
        const error = new ChatSDKError(
          "bad_request:api",
          "No active chatbot selected",
        );
        return error.toResponse();
      }

      try {
        const chat = await getChatById({ id });

        if (!chat || chat.chatbotId !== chatbotId) {
          const error = new ChatSDKError(
            "forbidden:chat",
            "Chat not found or access denied",
          );
          return error.toResponse();
        }

        const deletedChat = await deleteChatById({ id });
        return json(deletedChat, { status: 200 });
      } catch (error) {
        console.error(error);
        const chatError = new ChatSDKError(
          "bad_request:api",
          "An error occurred while processing your request",
        );
        return chatError.toResponse();
      }
    }),
  }),
);
