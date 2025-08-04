import { db } from "@/db";
import { organization, websiteSource } from "@/db/schema";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq, sql } from "drizzle-orm";
import z from "zod";

// Webhook payload schema based on Firecrawl documentation
const webhookPayloadSchema = z.object({
  success: z.boolean(),
  type: z.enum([
    "crawl.started",
    "crawl.page",
    "crawl.completed",
    "crawl.failed",
  ]),
  id: z.string(),
  data: z
    .array(
      z.object({
        markdown: z.string().optional(),
        metadata: z
          .object({
            sourceURL: z.string().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            statusCode: z.number().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
  metadata: z
    .object({
      userId: z.string().optional(),
      organizationId: z.string().optional(),
      originalUrl: z.string().optional(),
    })
    .optional(),
  error: z.string().optional(),
  creditsUsed: z.number().optional(),
  timestamp: z.string().optional(),
});

export const ServerRoute = createServerFileRoute(
  "/api/firecrawl-webhook",
).methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      console.log("Webhook received:", JSON.stringify(body, null, 2));

      const parsed = webhookPayloadSchema.safeParse(body);
      if (!parsed.success) {
        console.error("Invalid webhook payload:", parsed.error);
        return json({ error: "Invalid payload" }, { status: 400 });
      }

      const { type, data, metadata, error, id: jobId } = parsed.data;

      // Extract metadata
      const userId = metadata?.userId;
      const organizationId = metadata?.organizationId;
      const originalUrl = metadata?.originalUrl;

      if (!userId || !organizationId) {
        console.error("Missing userId or organizationId in webhook metadata");
        return json({ error: "Missing required metadata" }, { status: 400 });
      }

      switch (type) {
        case "crawl.started":
          console.log(`Crawl started for ${originalUrl}`);
          break;

        case "crawl.page":
          // Process individual page data as it comes in
          if (data && data.length > 0) {
            console.log(`Processing ${data.length} pages from crawl`);

            const insertedSources = [];
            for (const item of data) {
              const { markdown, metadata: pageMetadata } = item;
              if (markdown) {
                const [inserted] = await db
                  .insert(websiteSource)
                  .values({
                    userId,
                    organizationId,
                    url: pageMetadata?.sourceURL || originalUrl || "unknown",
                    markdown,
                    metadata: pageMetadata,
                    type: "crawl",
                    urlsCrawled: 1, // Individual page count
                    creditsUsed: 1, // Will be updated on completion
                    crawlJobId: jobId, // Track which job this belongs to
                  })
                  .returning();
                insertedSources.push(inserted);
              }
            }

            // Update organization sources count
            if (insertedSources.length > 0) {
              await db
                .update(organization)
                .set({
                  sourcesCount: sql`${organization.sourcesCount} + ${insertedSources.length}`,
                })
                .where(eq(organization.id, organizationId));
            }

            console.log(`Saved ${insertedSources.length} pages to database`);
          }
          break;

        case "crawl.completed":
          console.log(`Crawl completed for ${originalUrl}. Job ID: ${jobId}`);

          // For completed events, we don't get creditsUsed in the webhook
          // The credits are typically calculated based on the number of pages processed
          // We could track this by counting the pages we've already stored for this job

          console.log(`Crawl job ${jobId} completed successfully`);
          break;

        case "crawl.failed":
          console.error(`Crawl failed for ${originalUrl}:`, error);
          // You might want to update a status field or notify the user
          break;

        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      return json({ success: true, message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return json({ error: "Webhook processing failed" }, { status: 500 });
    }
  },
});
