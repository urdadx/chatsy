import { db } from "@/db";
import { Action, chatbot } from "@/db/schema";
import { cacheKeys, withCache } from "@/lib/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/embed/chatbot/$identifier",
).methods({
  GET: async ({ params, request }) => {
    const { identifier } = params;

    if (!identifier) {
      return new Response("Chatbot identifier is required", { status: 400 });
    }

    try {
      const isEmbedToken = identifier.startsWith("embed_");

      const chatbotData = await withCache(
        cacheKeys.chatbot.embed(identifier),
        async () => {
          const [publicChatbot] = await db
            .select({
              id: chatbot.id,
              organizationId: chatbot.organizationId,
              name: chatbot.name,
              image: chatbot.image,
              primaryColor: chatbot.primaryColor,
              theme: chatbot.theme,
              hidePoweredBy: chatbot.hidePoweredBy,
              initialMessage: chatbot.initialMessage,
              suggestedMessages: chatbot.suggestedMessages,
              isEmbeddingEnabled: chatbot.isEmbeddingEnabled,
              allowedDomains: chatbot.allowedDomains,
            })
            .from(chatbot)
            .where(
              isEmbedToken
                ? eq(chatbot.embedToken, identifier)
                : eq(chatbot.name, identifier),
            );

          if (!publicChatbot) {
            return null;
          }

          const actions = await db
            .select()
            .from(Action)
            .where(eq(Action.chatbotId, publicChatbot.id));

          return { ...publicChatbot, actions };
        },
        { ttl: 120000 },
      );

      if (!chatbotData) {
        return new Response("Chatbot not found", { status: 404 });
      }

      if (!chatbotData.isEmbeddingEnabled) {
        return new Response("Embedding is not enabled for this chatbot", {
          status: 403,
        });
      }

      // Check if the request is coming from an allowed domain
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

      const headers = new Headers({
        "Access-Control-Allow-Origin": referer ? new URL(referer).origin : "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });

      return json(chatbotData, { headers });
    } catch (error) {
      console.error("Error fetching public chatbot:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },

  OPTIONS: async () => {
    const corsHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return new Response(null, { status: 200, headers: corsHeaders });
  },
});
