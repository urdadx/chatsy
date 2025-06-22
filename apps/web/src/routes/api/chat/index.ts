import { db } from "@/db";
import { message } from "@/db/schema";
import { generateTitleFromUserMessage } from "@/lib/ai/generate-titles";
import { saveFinalAssistantMessage } from "@/lib/ai/save-assistant-message";
import type { Message } from "@/lib/ai/save-assistant-message";
import {
  deleteChatById,
  getChatById,
  getUserIdFromUsername,
  saveChat,
} from "@/lib/server-functions/chat-queries";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { streamText } from "ai";
import { auth } from "auth";

export const APIRoute = createAPIFileRoute("/api/chat")({
  POST: async ({ request }) => {
    try {
      const { id, messages, handle } = await request.json();

      const chat = await getChatById(id);
      // const result = await getSession();

      // if (!result.success || !result.userId) {
      //   return new Response(
      //     JSON.stringify({ error: "Could not get userId from handle" }),
      //     {
      //       status: 400,
      //     },
      //   );
      // }
      const userMessage = messages[messages.length - 1];
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return new Response("Unauthorized", { status: 401 });
      }

      if (!chat) {
        const title = await generateTitleFromUserMessage({
          message: userMessage,
        });

        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: "private",
        });
      }

      if (userMessage && userMessage?.role === "user") {
        try {
          await db.insert(message).values({
            chatId: id,
            role: "user",
            content: userMessage.content,
            parts: userMessage.parts,
          });
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const resultStream = streamText({
        model: google("gemini-2.5-flash"),
        system: "Hi, you are a helpful assistant.",
        messages,
        maxSteps: 5,
        tools: {},
        onError: (err) => {
          console.error("🛑 streamText error:", err);
        },
        async onFinish({ response }) {
          try {
            await saveFinalAssistantMessage(
              id,
              response.messages as unknown as Message[],
            );
            console.log(response.messages);
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

    try {
      const chat = await getChatById({ id });
      if (chat?.userId !== session.user.id) {
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
