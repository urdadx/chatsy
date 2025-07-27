import { db } from "@/db";
import { organization, websiteSource } from "@/db/schema";
import FirecrawlApp from "@mendable/firecrawl-js";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const scrapeRequestSchema = z.object({
  url: z.string().min(1),
});

const deleteRequestSchema = z.object({
  id: z.string().uuid(),
});

export const ServerRoute = createServerFileRoute("/api/scrape").methods({
  GET: async ({ request }) => {
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

    try {
      const scrapedData = await db
        .select()
        .from(websiteSource)
        .where(eq(websiteSource.organizationId, organizationId));

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
    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
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
            organizationId,
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
            .update(organization)
            .set({
              sourcesCount: sql`${organization.sourcesCount} + 1`,
            })
            .where(eq(organization.id, organizationId));
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

    const organizationId = session?.session?.activeOrganizationId;
    if (!organizationId) {
      return json({ error: "No active organization" }, { status: 400 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized: Please log in" }, { status: 401 });
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
          and(
            eq(websiteSource.id, id),
            eq(websiteSource.organizationId, organizationId),
          ),
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
        .update(organization)
        .set({
          sourcesCount: sql`greatest(0, ${organization.sourcesCount} - 1)`,
        })
        .where(eq(organization.id, organizationId));

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
