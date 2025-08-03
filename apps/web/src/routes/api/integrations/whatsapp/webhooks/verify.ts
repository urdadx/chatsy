import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute(
  "/api/integrations/whatsapp/webhooks/verify",
).methods({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Verify the webhook with Facebook
    if (
      mode === "subscribe" &&
      token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    ) {
      console.log("WhatsApp webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }

    console.error("WhatsApp webhook verification failed");
    return new Response("Verification failed", { status: 403 });
  },
});
