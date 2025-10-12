import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import FirecrawlApp from "@mendable/firecrawl-js";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "../../../auth";

const crawlRequestSchema = z.object({
  url: z.string().min(1),
  chatbotId: z.string().min(1).optional(),
});

export const ServerRoute = createServerFileRoute("/api/crawl").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }
    const activeChatbotId =
      session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

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
    const chatbotId = requestChatbotId || activeChatbotId;

    if (!chatbotId) {
      return json({ error: "No chatbot specified" }, { status: 400 });
    }
    try {
      const client = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY!,
      });
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;

      const requestUrl = new URL(request.url);
      const baseUrl =
        `${requestUrl.protocol}//${requestUrl.host}` ||
        process.env.WEBHOOK_BASE_URL!;
      const webhookUrl = `${baseUrl}/api/firecrawl-webhook`;

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
