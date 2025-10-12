import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { auth } from "../../../auth";

const analyticsSchema = z.object({
  chatbotId: z.string().min(1),
  visitorId: z.string().min(1),
  userAgent: z.string().optional(),
  deviceInfo: z
    .object({
      platform: z.string().optional(),
      deviceType: z.string().optional(),
    })
    .optional(),
  location: z
    .object({
      city: z.string().nullable().optional(),
      region: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      country_code: z.string().nullable().optional(),
      continent: z.string().nullable().optional(),
      ip: z.string().nullable().optional(),
    })
    .optional(),
  referer: z.string().nullable().optional(),
  event: z.string().optional(),
  durationMs: z.number().optional(),
  extra: z.any().optional(),
});

export const ServerRoute = createServerFileRoute(
  "/api/visitor-analytics",
).methods({
  POST: async ({ request }) => {
    const body = await request.json();
    const parsed = analyticsSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.format() }, { status: 400 });
    }
    const data = parsed.data;
    try {
      await db.insert(visitorAnalytics).values({
        chatbotId: data.chatbotId,
        visitorId: data.visitorId,
        userAgent: data.userAgent,
        deviceType: data.deviceInfo?.deviceType,
        platform: data.deviceInfo?.platform,
        city: data.location?.city,
        region: data.location?.region,
        country: data.location?.country,
        countryCode: data.location?.country_code,
        continent: data.location?.continent,
        ip: data.location?.ip,
        referer: data.referer,
        event: data.event,
        durationMs: data.durationMs,
        extra: data.extra,
      });
      return json({ success: true });
    } catch (error) {
      console.error("Error saving visitor analytics:", error);
      return json({ error: "Failed to save analytics" }, { status: 500 });
    }
  },
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
      const records = await db.query.visitorAnalytics.findMany({
        where: and(
          eq(visitorAnalytics.chatbotId, chatbotId),
          eq(visitorAnalytics.event, "page_visit"),
        ),
        orderBy: (
          fields: typeof visitorAnalytics._.columns,
          { desc }: { desc: any },
        ) => desc(fields.createdAt),
      });
      return json(records, { status: 200 });
    } catch (error) {
      console.error("Error fetching visitor analytics:", error);
      return json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
  },
});
