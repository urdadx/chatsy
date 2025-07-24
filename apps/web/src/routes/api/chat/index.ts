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
import { knowledgeSearchTool } from "@/lib/ai/tools/knowledge-search";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { streamText } from "ai";
import { auth } from "auth";
import { and, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/chat/").methods({
  POST: async ({ request }) => {
    try {
      const { id, messages } = await request.json();
      console.log("Received chat ID:", id);

      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return new Response("Unauthorized", { status: 401 });
      }

      const organizationId = session?.session?.activeOrganizationId as string;
      if (!organizationId) {
        return new Response("No active organization", { status: 400 });
      }

      // Verify user is a member of the organization
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, organizationId),
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
          organizationId,
          title,
          visibility: "private",
        });
      } else {
        // Verify the chat belongs to the user's organization
        if (chat.organizationId !== organizationId) {
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
      // get the chatbot name for the organization
      const [chatbotName] = await db
        .select({
          name: chatbot.name,
        })
        .from(chatbot)
        .where(eq(chatbot.organizationId, organizationId));

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const resultStream = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt(chatbotName.name ?? "Assistant"),
        messages,
        maxSteps: 5,
        tools: {
          knowledge_base: knowledgeSearchTool(organizationId),
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
      const headers = new Headers(originalResponse.headers);
      headers.set("X-Chat-Id", id);

      return new Response(originalResponse.body, {
        status: originalResponse.status,
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

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return new Response("No active organization", { status: 400 });
    }

    // Verify user is a member of the organization
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      );

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      const chat = await getChatById({ id });

      // Check if chat exists and belongs to the user AND the organization
      if (
        !chat ||
        chat.userId !== session.user.id ||
        chat.organizationId !== organizationId
      ) {
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
