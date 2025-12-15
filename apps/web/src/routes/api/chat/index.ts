import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { db } from "@/db";
import { chatbot, message } from "@/db/schema";
import { buildActiveTools } from "@/lib/ai/build-active-tools";
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/ai/chat-functions";
import { getActiveToolsWithActions } from "@/lib/ai/get-active-tools";
import { systemPrompt } from "@/lib/ai/prompts/system-prompt";
import { openai } from "@/lib/ai/providers";
import { ChatSDKError } from "@/lib/errors";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { getCustomerExternalId } from "@/lib/subscription/subscription-functions";
import { detectDeviceFromUserAgent, generateUUID } from "@/lib/utils";
import {
  chatRateLimitMiddleware,
  subscriptionMiddleware,
  tokenUsageMiddleware,
} from "@/middlewares";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import {
  JsonToSseTransformStream,
  convertToModelMessages,
  createUIMessageStream,
  pruneMessages,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { auth, polarClient } from "auth";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/chat/").methods(
  (api) => ({
    POST: api
      .middleware([
        subscriptionMiddleware,
        tokenUsageMiddleware,
        chatRateLimitMiddleware,
      ])
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
          const chat = await getChatById({ id });

          const shouldAIRespond =
            chat?.status !== "escalated" && chat?.status !== "resolved";

          const userMessage = messages[messages.length - 1];

          if (!chat) {
            const title = userMessage.parts[0].text;

            // Capture user metadata
            const userAgent = request.headers.get("user-agent") || "";
            const timezone =
              request.headers.get("x-timezone") ||
              Intl.DateTimeFormat().resolvedOptions().timeZone;

            const country = request.headers.get("cf-ipcountry") || "GH";
            const city = request.headers.get("cf-ipcity") || "Accra";
            const deviceInfo = detectDeviceFromUserAgent(userAgent);

            const chatMetaData = {
              country,
              city,
              timezone,
              device: deviceInfo,
            };

            await saveChat({
              id,
              userId: session?.user.id,
              chatbotId,
              title,
              visibility: "private",
              channel: "web",
              chatMetaData,
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

          // If chat is escalated or resolved, don't generate AI response
          if (!shouldAIRespond) {
            return json(
              {
                message:
                  "Chat is escalated or resolved. AI responses are disabled.",
              },
              { status: 200 },
            );
          }

          // Get active tools and their actions in a single query
          const { activeToolNames, toolsMap } =
            await getActiveToolsWithActions(chatbotId);

          const chatbotName = chatbotData.name || "AI Assistant";
          const chatbotPersonality = chatbotData.personality || "support";
          const organizationId = chatbotData.organizationId;

          // Build tools object with only active tools
          const tools = buildActiveTools({
            activeToolNames,
            chatbotId,
            chatId: id,
            organizationId,
          });

          const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
              const modelMessages = convertToModelMessages(uiMessages, {
                ignoreIncompleteToolCalls: true,
              });

              const prunedMessages = pruneMessages({
                messages: modelMessages,
                reasoning: "all",
                toolCalls: "before-last-message",
                emptyMessages: "remove",
              });

              const result = streamText({
                model: openai("gpt-4o-mini"),
                system: systemPrompt(chatbotName, chatbotPersonality, toolsMap),
                messages: prunedMessages,
                stopWhen: stepCountIs(5),
                experimental_transform: smoothStream({ chunking: "word" }),
                tools,
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
