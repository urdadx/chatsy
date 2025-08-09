import FirecrawlApp from "@mendable/firecrawl-js";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import z from "zod";

const crawlRequestSchema = z.object({
  url: z.string().min(1),
  // chatbotId is optional since we get it from session
  chatbotId: z.string().min(1).optional(),
});

export const ServerRoute = createServerFileRoute("/api/crawl").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    const activeChatbotId = session?.session.activeChatbotId;

    if (!activeChatbotId) {
      return json({ error: "No active chatbot" }, { status: 400 });
    }
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = crawlRequestSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { url, chatbotId: requestChatbotId } = parsed.data;

    // Use chatbotId from request if provided, otherwise use active chatbot from session
    const chatbotId = requestChatbotId || activeChatbotId;

    if (!chatbotId) {
      return json({ error: "No chatbot specified" }, { status: 400 });
    }
    try {
      const client = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY!,
      });
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;

      // Get the webhook URL - use WEBHOOK_BASE_URL if set (for ngrok), otherwise construct from request
      const requestUrl = new URL(request.url);
      const baseUrl =
        process.env.WEBHOOK_BASE_URL! ||
        `${requestUrl.protocol}//${requestUrl.host}`;
      const webhookUrl = `${baseUrl}/api/firecrawl-webhook`;

      console.log("Using webhook URL:", webhookUrl);

      const response = (await client.asyncCrawlUrl(fullUrl, {
        limit: 100,
        scrapeOptions: {
          formats: ["markdown"],
        },
        webhook: {
          url: webhookUrl,
          metadata: {
            userId,
            chatbotId: chatbotId,
            originalUrl: fullUrl,
          },
        },
      })) as any;

      console.log("Async crawl response:", response);

      // Return the job ID for tracking
      return json({
        success: true,
        jobId: response.id,
        message:
          "Crawl started. You will see pages appear as they are processed.",
        url: fullUrl,
      });
    } catch (error) {
      console.error("Crawling error:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return json(
        { error: "Failed to crawl the website.", details: message },
        { status: 500 },
      );
    }
  },
});
