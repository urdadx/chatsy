import { db } from "@/db";
import { chatbot, member, message } from "@/db/schema";
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
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Ingestion } from "@polar-sh/ingestion";
import { LLMStrategy } from "@polar-sh/ingestion/strategies/LLM";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { streamText } from "ai";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

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

export const ServerRoute = createServerFileRoute("/api/chat/").methods({
  POST: async ({ request }) => {
    try {
      const { id, messages } = await request.json();

      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return new Response("Unauthorized", { status: 401 });
      }

      const chatbotId = session?.session?.activeChatbotId;
      if (!chatbotId) {
        return new Response("No active chatbot", { status: 400 });
      }

      // Verify the chatbot exists and user has access to its organization
      const [chatbotData] = await db
        .select({
          organizationId: chatbot.organizationId,
          name: chatbot.name,
        })
        .from(chatbot)
        .where(eq(chatbot.id, chatbotId));

      if (!chatbotData) {
        return new Response("Chatbot not found", { status: 404 });
      }

      const externalCustomerId = session.user.id;

      // Verify user is a member of the chatbot's organization
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, chatbotData.organizationId),
          ),
        );

      if (!membership) {
        return new Response("Forbidden", { status: 403 });
      }

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
        // Verify the chat belongs to the same chatbot
        if (chat.chatbotId !== chatbotId) {
          return new Response("Forbidden", { status: 403 });
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
      // get the chatbot name
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
  },

  DELETE: async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new Response("Not Found", { status: 404 });

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return new Response("Unauthorized", { status: 401 });

    const chatbotId = session?.session?.activeChatbotId;
    if (!chatbotId) {
      return new Response("No active chatbot", { status: 400 });
    }

    // Verify the chatbot exists and get its organization
    const [chatbotData] = await db
      .select({
        organizationId: chatbot.organizationId,
      })
      .from(chatbot)
      .where(eq(chatbot.id, chatbotId));

    if (!chatbotData) {
      return new Response("Chatbot not found", { status: 404 });
    }

    // Verify user is a member of the chatbot's organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, chatbotData.organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      const chat = await getChatById({ id });

      // Check if chat exists and belongs to the chatbot
      if (!chat || chat.chatbotId !== chatbotId) {
        return new Response("Forbidden", { status: 403 });
      }

      const deletedChat = await deleteChatById({ id });
      return json(deletedChat, { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response("An error occurred while processing your request!", {
        status: 500,
      });
    }
  },
});
