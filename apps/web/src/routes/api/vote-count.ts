import { getTotalVotes } from "@/lib/ai/chat-functions";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "../../../auth";

export const ServerRoute = createServerFileRoute("/api/vote-count").methods({
  GET: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const chatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

    if (!chatbotId) {
      return json(
        { error: "Unauthorized: Please log in or no active chatbot" },
        { status: 401 },
      );
    }
    try {
      const voteData = await withCache(
        `vote-count:${chatbotId}`,
        async () => {
          return await getTotalVotes({ chatbotId });
        },
        { ttl: 60 },
      );
      return json(voteData, { status: 200 });
    } catch (error) {
      console.error("Error getting total votes:", error);
      return json({ error: "Failed to get total votes" }, { status: 500 });
    }
  },
});
