import { db } from "@/db";
import { chat, chatbot, message } from "@/db/schema";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import {
  type Message,
  saveFinalAssistantMessage,
} from "@/lib/ai/save-assistant-message";
import { systemPrompt } from "@/lib/ai/system-prompt";
import { collectFeedbackTool } from "@/lib/ai/tools/collect-feedback";
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { streamText } from "ai";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/embed/chat/$embedToken",
).methods({
  POST: async ({ params, request }) => {
    const { embedToken } = params;

    if (!embedToken) {
      return new Response("Embed token is required", { status: 400 });
    }

    try {
      const { id, messages } = await request.json();

      // Verify the chatbot exists and embedding is enabled
      const [chatbotData] = await db
        .select({
          organizationId: chatbot.organizationId,
          name: chatbot.name,
          isEmbeddingEnabled: chatbot.isEmbeddingEnabled,
          allowedDomains: chatbot.allowedDomains,
        })
        .from(chatbot)
        .where(eq(chatbot.embedToken, embedToken));

      if (!chatbotData) {
        return new Response("Chatbot not found", { status: 404 });
      }

      if (!chatbotData.isEmbeddingEnabled) {
        return new Response("Embedding is not enabled for this chatbot", {
          status: 403,
        });
      }

      // Check domain restrictions
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
          return new Response("Domain not allowed", { status: 403 });
        }
      }

      // Check if chat exists, if not create it
      const [existingChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, id));

      const userMessage = messages[messages.length - 1];

      if (!existingChat) {
        const title = await generateTitleFromUserMessage({
          message: userMessage,
        });

        // Create chat without userId (anonymous public chat)
        await db
          .insert(chat)
          .values({
            id,
            createdAt: new Date(),
            userId: null, // Anonymous chat for embedded widget
            organizationId: chatbotData.organizationId,
            title,
            visibility: "public",
          })
          .onConflictDoNothing();
      }

      // Save user message
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

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const resultStream = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt(chatbotData.name ?? "Assistant"),
        messages,
        maxSteps: 5,
        tools: {
          knowledge_base: knowledgeSearchTool(chatbotData.organizationId),
          collect_feedback: collectFeedbackTool,
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

      resultStream.consumeStream();
      const originalResponse = resultStream.toDataStreamResponse();

      // Add CORS headers for embedded widgets
      const headers = new Headers(originalResponse.headers);
      headers.set("X-Chat-Id", id);
      headers.set(
        "Access-Control-Allow-Origin",
        referer ? new URL(referer).origin : "*",
      );
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      return new Response(originalResponse.body, {
        status: originalResponse.status,
        headers,
      });
    } catch (err: any) {
      console.error("Error in /api/embed/chat:", err);
      return json(
        { error: err?.message || "Internal server error" },
        { status: err?.code === "DAILY_LIMIT_REACHED" ? 403 : 500 },
      );
    }
  },

  OPTIONS: async ({ request }) => {
    // Handle CORS preflight requests
    const referer = request.headers.get("referer");
    const headers = new Headers({
      "Access-Control-Allow-Origin": referer ? new URL(referer).origin : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return new Response(null, { status: 200, headers });
  },
});
