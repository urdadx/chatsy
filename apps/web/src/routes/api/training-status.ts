import { db } from "@/db";
import { chatbot } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";

export const ServerRoute = createServerFileRoute(
  "/api/training-status",
).methods({
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
      const result = await withCache(
        `training-status:${chatbotId}`,
        async () => {
          return await db
            .select({ trainingStatus: chatbot.trainingStatus })
            .from(chatbot)
            .where(eq(chatbot.id, chatbotId));
        },
        { ttl: 10 },
      );

      if (result.length === 0) {
        return json({ status: "idle" });
      }

      return json({ status: result[0].trainingStatus });
    } catch (error) {
      console.error("Error fetching training status:", error);
      return json(
        { error: "Failed to fetch training status." },
        { status: 500 },
      );
    }
  },
});
