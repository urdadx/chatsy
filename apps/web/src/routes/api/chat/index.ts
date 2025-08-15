import { db } from "@/db";
import { chatbot, message } from "@/db/schema";
import { deleteChatById, getChatById, saveChat } from "@/lib/ai/chat-functions";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import {
  type Message,
  saveFinalAssistantMessage,
} from "@/lib/ai/save-assistant-message";
import { systemPrompt } from "@/lib/ai/system-prompt";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback";
import { collectLeadsTool } from "@/lib/ai/tools/collect-leads";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { ChatSDKError } from "@/lib/errors";
import { subscriptionMiddleware, tokenUsageMiddleware } from "@/middlewares";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Ingestion } from "@polar-sh/ingestion";
import { LLMStrategy } from "@polar-sh/ingestion/strategies/LLM";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { streamText } from "ai";
import { auth } from "auth";
import { eq } from "drizzle-orm";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Setup the LLM Ingestion Strategy
const llmIngestion = Ingestion({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox",
})
  .strategy(new LLMStrategy(google("gemini-2.0-flash")))
  .ingest("ai_usage_two");

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

          if (context.hasActiveSubscription === false) {
            const error = new ChatSDKError("forbidden:subscription");
            return error.toResponse();
          }

          if (context.tokensLeft === 0) {
            const error = new ChatSDKError("forbidden:tokens");
            return error.toResponse();
          }

          const chatbotId = session?.session.activeChatbotId;

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

          const externalCustomerId = session.user?.id;
          const chat = await getChatById(id);
          const userMessage = messages[messages.length - 1];

          if (!chat) {
            const title = await generateTitleFromUserMessage({
              message: userMessage,
            });
            await saveChat({
              id,
              userId: session.user.id,
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

          if (userMessage && userMessage?.role === "user") {
            try {
              await db
                .insert(message)
                .values({
                  chatId: id,
                  role: "user",
                  content: userMessage.content,
                  parts: userMessage.parts,
                })
                .onConflictDoNothing();
            } catch (error) {
              console.error("Error saving user message:", error);
            }
          }

          const model = llmIngestion.client({
            externalCustomerId:
              request.headers.get("X-Polar-Customer-Id") ?? externalCustomerId,
          });

          const resultStream = streamText({
            model,
            system: systemPrompt(chatbotData.name ?? "Assistant"),
            messages,
            maxSteps: 5,
            tools: {
              knowledge_base: knowledgeSearchTool(chatbotId),
              collect_feedback: collectFeedbackTool,
              collect_leads: collectLeadsTool,
            },
            onError: (err) => {
              console.error("🛑 streamText error:", err);
            },
            async onFinish({ response }) {
              try {
                await saveFinalAssistantMessage(
                  id,
                  response.messages as unknown as Message[],
                );
              } catch (err) {
                console.error(
                  "Error in onFinish while saving assistant messages:",
                  err,
                );
              }
            },
          });

          const response = resultStream.toDataStreamResponse();

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
