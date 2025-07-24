import {
  getChatById,
  getVotesByChatId,
  voteMessage,
} from "@/lib/ai/chat-functions";
import { ChatSDKError } from "@/lib/errors";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { z } from "zod";

const voteSchema = z.object({
  chatId: z.string().min(1),
  messageId: z.string().min(1),
  type: z.enum(["up", "down"]),
});

export const ServerRoute = createServerFileRoute("/api/vote").methods({
  PATCH: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { chatId, messageId, type } = parsed.data;

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return json({ error: "Chat not found" }, { status: 404 });
    }

    try {
      const result = await voteMessage({ chatId, messageId, type });
      return json(result);
    } catch (error) {
      console.error("Error voting on message:", error);
      return json({ error: "Failed to vote on message" }, { status: 500 });
    }
  },
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return json({ error: "Chat ID is required" }, { status: 400 });
    }

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return new ChatSDKError("not_found:chat").toResponse();
    }

    if (chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:vote").toResponse();
    }

    const votes = await getVotesByChatId({ id: chatId });
    return json(votes, { status: 200 });
  },
});
