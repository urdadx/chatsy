import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { db } from "@/db";
import { chatbot, message } from "@/db/schema";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/ai/chat-functions";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import { getActiveTools } from "@/lib/ai/get-active-tools";
import { systemPrompt } from "@/lib/ai/system-prompt";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback";
import { collectLeadsTool } from "@/lib/ai/tools/collect-leads";
import { escalateToHumanTool } from "@/lib/ai/tools/escalate-to-human-tool";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { getCustomerExternalId } from "@/lib/subscription/subscription-functions";
import { generateUUID } from "@/lib/utils";
import { subscriptionMiddleware, tokenUsageMiddleware } from "@/middlewares";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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

          const streamId = generateUUID();
          await createStreamId({ streamId, chatId: id });

          // Get active tools from database
          const activeTools = await getActiveTools();

          const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
              const result = streamText({
                model: google("gemini-2.0-flash"),
                system: systemPrompt(chatbotData.name ?? "Assistant"),
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
                    chatId: id,
                    chatbotId,
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
            onError: (error) => {
              console.log("Error in createUIMessageStream:", error);
              return "Oops, an error occurred!";
            },
          });

          const response = new Response(
            stream.pipeThrough(new JsonToSseTransformStream()),
          );

          // Add custom headers including chat ID
          const headers = new Headers(response.headers);
          headers.set("X-Chat-Id", id);
          headers.set("Cache-Control", "no-cache");
          headers.set("Connection", "keep-alive");

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

    DELETE: api
      .middleware([subscriptionMiddleware])
      .handler(async ({ request }) => {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
          const error = new ChatSDKError(
            "not_found:chat",
            "Chat ID is required",
          );
          return error.toResponse();
        }

        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          const error = new ChatSDKError("unauthorized:chat");
          return error.toResponse();
        }

        const chatbotId = session?.session?.activeChatbotId;
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
