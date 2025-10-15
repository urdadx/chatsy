import { db } from "@/db";
import { documentSource, textSource, websiteSource } from "@/db/schema";
import { cacheKeys, withCache } from "@/lib/cache";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { count, eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute("/api/sources/count").methods({
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

    const totalCount = await withCache(
      cacheKeys.sources.count(userId, chatbotId),
      async () => {
        const textSourcesCount = await db
          .select({ value: count() })
          .from(textSource)
          .where(eq(textSource.chatbotId, chatbotId));

        const documentSourcesCount = await db
          .select({ value: count() })
          .from(documentSource)
          .where(eq(documentSource.chatbotId, chatbotId));

        const websiteSourcesCount = await db
          .select({ value: count() })
          .from(websiteSource)
          .where(eq(websiteSource.chatbotId, chatbotId));

        return (
          (textSourcesCount[0]?.value || 0) +
          (documentSourcesCount[0]?.value || 0) +
          (websiteSourcesCount[0]?.value || 0)
        );
      },
      { ttl: 60000 },
    );

    return json({ count: totalCount });
  },
});
