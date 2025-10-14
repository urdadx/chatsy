import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { cacheKeys, withCache } from "@/lib/cache";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, count, desc, eq, gte, isNotNull } from "drizzle-orm";
import { auth } from "../../../auth";

interface AnalyticsData {
  totalVisits: number;
  averageSessionTime: number;
  activeVisitors: number;
  bioPageSessions: number;
  widgetSessions: number;
  bioPageAverage: number;
  widgetAverage: number;
  totalSessions: number;
  recentActivity: {
    timestamp: string;
    visits: number;
    chats: number;
  }[];
}

// ============================================================================
// Analytics Data Fetcher
// ============================================================================

async function getAnalyticsData(chatbotId: string): Promise<AnalyticsData> {
  return withCache(
    cacheKeys.analytics.data(chatbotId),
    async () => {
      try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [
          totalVisitsResult,
          recentActivity,
          sessionRecords,
          last24HoursVisits,
        ] = await Promise.all([
          db
            .select({ count: count() })
            .from(visitorAnalytics)
            .where(
              and(
                eq(visitorAnalytics.chatbotId, chatbotId),
                eq(visitorAnalytics.event, "page_visit"),
              ),
            ),
          db.query.visitorAnalytics.findMany({
            where: and(
              eq(visitorAnalytics.chatbotId, chatbotId),
              gte(visitorAnalytics.createdAt, fiveMinutesAgo),
            ),
            columns: {
              visitorId: true,
              event: true,
              createdAt: true,
            },
            orderBy: desc(visitorAnalytics.createdAt),
          }),
          // Session duration data
          db.query.visitorAnalytics.findMany({
            where: and(
              eq(visitorAnalytics.chatbotId, chatbotId),
              isNotNull(visitorAnalytics.durationMs),
            ),
            columns: {
              durationMs: true,
              event: true,
              extra: true,
            },
          }),
          // Last 24 hours visits
          db.query.visitorAnalytics.findMany({
            where: and(
              eq(visitorAnalytics.chatbotId, chatbotId),
              eq(visitorAnalytics.event, "page_visit"),
              gte(visitorAnalytics.createdAt, last24Hours),
            ),
            columns: {
              createdAt: true,
            },
          }),
        ]);

        // Calculate active visitors
        const visitorLastEvent = new Map<
          string,
          { event: string; timestamp: Date }
        >();
        recentActivity.forEach((activity) => {
          const existing = visitorLastEvent.get(activity.visitorId);
          const activityTime = new Date(activity.createdAt);

          if (!existing || activityTime > existing.timestamp) {
            visitorLastEvent.set(activity.visitorId, {
              event: activity.event || "",
              timestamp: activityTime,
            });
          }
        });

        const activeVisitors = Array.from(visitorLastEvent.values()).filter(
          (lastEvent) =>
            !lastEvent.event.includes("unload") &&
            !lastEvent.event.includes("closed"),
        ).length;

        // Calculate session averages
        const calculateAverage = (sessions: typeof sessionRecords) => {
          if (sessions.length === 0) return 0;
          const totalDuration = sessions.reduce(
            (sum, session) => sum + (session.durationMs || 0),
            0,
          );
          return Math.round(totalDuration / sessions.length);
        };

        const bioPageSessions = sessionRecords.filter(
          (record) =>
            (record.extra as any)?.page_type === "bio_page" ||
            record.event === "page_unload",
        );

        const widgetSessions = sessionRecords.filter(
          (record) =>
            (record.extra as any)?.widget_type === "chat_widget" ||
            record.event === "widget_closed" ||
            record.event === "widget_page_unload",
        );

        // Group last 24 hours by hour
        const hourlyActivity = [];
        for (let i = 23; i >= 0; i--) {
          const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
          hourStart.setMinutes(0, 0, 0);
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

          const visitsInHour = last24HoursVisits.filter((visit) => {
            const visitTime = new Date(visit.createdAt);
            return visitTime >= hourStart && visitTime < hourEnd;
          }).length;

          hourlyActivity.push({
            timestamp: hourStart.toISOString(),
            visits: visitsInHour,
            chats: 0,
          });
        }

        return {
          totalVisits: totalVisitsResult[0]?.count || 0,
          activeVisitors,
          averageSessionTime: calculateAverage(sessionRecords),
          totalSessions: sessionRecords.length,
          bioPageSessions: bioPageSessions.length,
          widgetSessions: widgetSessions.length,
          bioPageAverage: calculateAverage(bioPageSessions),
          widgetAverage: calculateAverage(widgetSessions),
          recentActivity: hourlyActivity,
        };
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        throw error;
      }
    },
    { ttl: 3000 },
  );
}

// ============================================================================
// SSE Route Handler
// ============================================================================

export const ServerRoute = createServerFileRoute(
  "/api/analytics-stream",
).methods({
  GET: async ({ request }) => {
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

    const stream = new ReadableStream({
      async start(controller) {
        let lastHash = "";

        const sendUpdate = async () => {
          try {
            const data = await getAnalyticsData(chatbotId);
            const dataString = JSON.stringify(data);
            const currentHash = simpleHash(dataString);

            // Only send if data changed
            if (currentHash !== lastHash) {
              lastHash = currentHash;
              const message = `data: ${dataString}\n\n`;
              controller.enqueue(new TextEncoder().encode(message));
            }
          } catch (error) {
            console.error("SSE error:", error);
            const errorMessage = `data: ${JSON.stringify({ error: "Failed to fetch data" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorMessage));
          }
        };

        await sendUpdate();

        const interval = setInterval(sendUpdate, 5000);

        // Cleanup
        const cleanup = () => {
          clearInterval(interval);
          controller.close();
        };

        request.signal?.addEventListener("abort", cleanup);

        setTimeout(cleanup, 5 * 60 * 1000);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  },
});

// Simple hash function for change detection
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString();
}
