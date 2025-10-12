import { db } from "@/db";
import { chatbot, websiteSource } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import FirecrawlApp from "@mendable/firecrawl-js";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const scrapeRequestSchema = z.object({
  url: z.string().min(1),
});

const deleteRequestSchema = z.object({
  id: z.string(),
});

export const ServerRoute = createServerFileRoute("/api/scrape").methods({
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
      const scrapedData = await db
        .select()
        .from(websiteSource)
        .where(eq(websiteSource.chatbotId, chatbotId));

      return json({ success: true, data: scrapedData });
    } catch (error) {
      console.error("Error fetching scraped data:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return json(
        {
          success: false,
          error: "Failed to fetch scraped data.",
          details: message,
        },
        { status: 500 },
      );
    }
  },
  POST: async ({ request }) => {
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

    const body = await request.json();
    const parsed = scrapeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { url } = parsed.data;

    try {
      const client = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
      });

      const fullUrl = url.startsWith("http") ? url : `https://${url}`;

      const response = (await client.scrapeUrl(fullUrl, {
        formats: ["markdown"],
      })) as any;

      if (response) {
        const { markdown, metadata } = response;

        const [inserted] = await db
          .insert(websiteSource)
          .values({
            userId,
            chatbotId,
            url: fullUrl,
            markdown,
            metadata,
            type: "scrape",
            urlsCrawled: 1,
            creditsUsed: 1,
          })
          .returning();

        if (inserted) {
          await db
            .update(chatbot)
            .set({
              sourcesCount: sql`${chatbot.sourcesCount} + 1`,
            })
            .where(eq(chatbot.id, chatbotId));
        }

        return json({ success: true, data: inserted });
      }

      return json({
        success: false,
        error: "Failed to save content from the website.",
      });
    } catch (error) {
      console.error("Scraping error:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      return json(
        {
          success: false,
          error: "Failed to scrape the website.",
          details: message,
        },
        { status: 500 },
      );
    }
  },
  DELETE: async ({ request }) => {
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

    const body = await request.json();
    const parsed = deleteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id } = parsed.data;

    try {
      const [source] = await db
        .select()
        .from(websiteSource)
        .where(
          and(eq(websiteSource.id, id), eq(websiteSource.chatbotId, chatbotId)),
        );

      if (!source) {
        return json(
          {
            error:
              "Source not found or you don't have permission to delete it.",
          },
          { status: 404 },
        );
      }

      await db.delete(websiteSource).where(eq(websiteSource.id, id));

      await db
        .update(chatbot)
        .set({
          sourcesCount: sql`greatest(0, ${chatbot.sourcesCount} - 1)`,
        })
        .where(eq(chatbot.id, chatbotId));

      return json({ success: true });
    } catch (error) {
      console.error("Error deleting website source:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return json(
        {
          success: false,
          error: "Failed to delete website source.",
          details: message,
        },
        { status: 500 },
      );
    }
  },
});
