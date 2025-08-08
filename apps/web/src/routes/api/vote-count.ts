import { getTotalVotes } from "@/lib/ai/chat-functions";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";

export const ServerRoute = createServerFileRoute("/api/vote-count").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    const chatbotId = request.headers.get("X-Chatbot-Id");

    if (!userId || !chatbotId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    try {
      const { upvotes, downvotes } = await getTotalVotes({ chatbotId });
      return json({ upvotes, downvotes }, { status: 200 });
    } catch (error) {
      console.error("Error getting total votes:", error);
      return json({ error: "Failed to get total votes" }, { status: 500 });
    }
  },
});
