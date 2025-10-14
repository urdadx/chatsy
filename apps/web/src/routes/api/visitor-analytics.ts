import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { getLocationFromCloudflare } from "@/lib/cloudflare-headers";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { deleteCachedData, withCache } from "@/lib/redis/cache";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const analyticsSchema = z.object({
  chatbotId: z.string().min(1),
  visitorId: z.string().min(1),
  userAgent: z.string().optional(),
  deviceInfo: z
    .object({
      platform: z.string().optional(),
      deviceType: z.enum(["Mobile", "Tablet", "Desktop"]).optional(),
    })
    .optional(),
  referer: z.string().nullable().optional(),
  event: z.string().optional(),
  durationMs: z.number().optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

export const ServerRoute = createServerFileRoute(
  "/api/visitor-analytics",
).methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const parsed = analyticsSchema.safeParse(body);

      if (!parsed.success) {
        return json(
          { error: "Invalid data", details: parsed.error.issues },
          { status: 400 },
        );
      }

      const data = parsed.data;
      const location = getLocationFromCloudflare(request.headers);

      await db.insert(visitorAnalytics).values({
        chatbotId: data.chatbotId,
        visitorId: data.visitorId,
        userAgent: data.userAgent,
        deviceType: data.deviceInfo?.deviceType,
        platform: data.deviceInfo?.platform,
        city: location.city,
        region: location.region,
        country: location.country,
        countryCode: location.countryCode,
        continent: location.continent,
        ip: location.ip,
        referer: data.referer,
        event: data.event,
        durationMs: data.durationMs,
        extra: data.extra,
      });

      await deleteCachedData(`analytics:${data.chatbotId}`);

      return json({ success: true });
    } catch (error) {
      console.error("Error saving visitor analytics:", error);
      return json({ error: "Failed to save analytics" }, { status: 500 });
    }
  },

  GET: async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers || new Headers(),
      });

      const userId = session?.user?.id;
      if (!userId) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }

      const chatbotId =
        session?.session?.activeChatbotId || (await getActiveChatbotId(userId));

      if (!chatbotId) {
        return json({ error: "No active chatbot" }, { status: 401 });
      }

      const records = await withCache(
        `analytics:${chatbotId}`,
        async () => {
          return await db.query.visitorAnalytics.findMany({
            where: and(
              eq(visitorAnalytics.chatbotId, chatbotId),
              eq(visitorAnalytics.event, "page_visit"),
            ),
            orderBy: desc(visitorAnalytics.createdAt),
            limit: 500,
          });
        },
        { ttl: 60 },
      );

      return json(records, { status: 200 });
    } catch (error) {
      console.error("Error fetching visitor analytics:", error);
      return json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
  },
});
