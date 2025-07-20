import { db } from "@/db";
import { websiteSource } from "@/db/schema";
import FirecrawlApp from "@mendable/firecrawl-js";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { z } from "zod";

const crawlRequestSchema = z.object({
  url: z.string().min(1),
});

export const ServerRoute = createServerFileRoute("/api/crawl").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers || new Headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }
    if (!userId || !organizationId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = crawlRequestSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }

    const { url } = parsed.data;

    try {
      const client = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
      });
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = (await client.crawlUrl(fullUrl, {
        limit: 100,
        scrapeOptions: {
          formats: ["markdown"],
        },
      })) as any;

      const scrapedData = response.data;
      console.log("Scraped Data:", scrapedData);

      if (scrapedData.length === 0) {
        const insertedSources = [];
        for (const item of scrapedData) {
          const { markdown, metadata } = item;
          if (markdown) {
            const [inserted] = await db
              .insert(websiteSource)
              .values({
                userId,
                organizationId,
                url: fullUrl,
                markdown,
                metadata,
                type: "crawl",
              })
              .returning();
            insertedSources.push(inserted);
          }
        }
        return json({ success: true, data: insertedSources });
      }
      return json({
        success: false,
        error: "Failed to extract content.",
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
