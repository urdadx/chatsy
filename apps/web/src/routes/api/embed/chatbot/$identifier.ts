import { db } from "@/db";
import { chatbot } from "@/db/schema";
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
        return new Response("Chatbot not found", { status: 404 });
      }

      if (!publicChatbot.isEmbeddingEnabled) {
        return new Response("Embedding is not enabled for this chatbot", {
          status: 403,
        });
      }

      // Check if the request is coming from an allowed domain
      const referer = request.headers.get("referer");

      if (
        publicChatbot.allowedDomains &&
        publicChatbot.allowedDomains.length > 0
      ) {
        const requestDomain = referer ? new URL(referer).hostname : null;

        if (
          !requestDomain ||
          !publicChatbot.allowedDomains.some(
            (domain) =>
              requestDomain === domain || requestDomain.endsWith(`.${domain}`),
          )
        ) {
          return new Response("Domain not allowed", { status: 403 });
        }
      }

      // Set CORS headers to allow embedding
      const headers = new Headers({
        "Access-Control-Allow-Origin": referer ? new URL(referer).origin : "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });

      return json(publicChatbot, { headers });
    } catch (error) {
      console.error("Error fetching public chatbot:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },

  OPTIONS: async ({ request }) => {
    // Handle CORS preflight requests
    console.log(request.headers.get("origin"));
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return new Response(null, { status: 200, headers });
  },
});
