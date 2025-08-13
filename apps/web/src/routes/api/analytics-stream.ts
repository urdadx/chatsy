import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "auth";
import { and, count, desc, eq, gte, isNotNull } from "drizzle-orm";

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

async function getAnalyticsData(chatbotId: string): Promise<AnalyticsData> {
  try {
    // Get total visits count (only count page_visit events, not unload events)
    const [totalVisitsResult] = await db
      .select({ count: count() })
      .from(visitorAnalytics)
      .where(
        and(
          eq(visitorAnalytics.chatbotId, chatbotId),
          eq(visitorAnalytics.event, "page_visit"),
        ),
      );

    const totalVisits = totalVisitsResult?.count || 0;

    // Get active visitors (more accurate: exclude those who have unloaded recently)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get all recent activity (both visits and unloads)
    const recentVisitorActivity = await db.query.visitorAnalytics.findMany({
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
    });

    // Track active visitors by finding the most recent event for each visitor
    const visitorLastEvent = new Map<
      string,
      { event: string; timestamp: Date }
    >();

    recentVisitorActivity.forEach((activity) => {
      const existing = visitorLastEvent.get(activity.visitorId);
      const activityTime = new Date(activity.createdAt);

      if (!existing || activityTime > existing.timestamp) {
        visitorLastEvent.set(activity.visitorId, {
          event: activity.event || "",
          timestamp: activityTime,
        });
      }
    });

    // Count visitors whose last event was NOT an unload event
    const activeVisitors = Array.from(visitorLastEvent.values()).filter(
      (lastEvent) =>
        !lastEvent.event.includes("unload") &&
        !lastEvent.event.includes("closed"),
    ).length;

    // Get session time data
    const records = await db.query.visitorAnalytics.findMany({
      where: and(
        eq(visitorAnalytics.chatbotId, chatbotId),
        isNotNull(visitorAnalytics.durationMs),
      ),
      columns: {
        durationMs: true,
        event: true,
        extra: true,
        createdAt: true,
      },
    });

    if (records.length === 0) {
      return {
        totalVisits,
        activeVisitors,
        averageSessionTime: 0,
        totalSessions: 0,
        bioPageSessions: 0,
        widgetSessions: 0,
        bioPageAverage: 0,
        widgetAverage: 0,
        recentActivity: [],
      };
    }

    // Separate bio page and widget sessions
    const bioPageSessions = records.filter(
      (record) =>
        (record.extra as any)?.page_type === "bio_page" ||
        record.event === "page_unload",
    );

    const widgetSessions = records.filter(
      (record) =>
        (record.extra as any)?.widget_type === "chat_widget" ||
        record.event === "widget_closed" ||
        record.event === "widget_page_unload",
    );

    // Calculate averages
    const calculateAverage = (sessions: typeof records) => {
      if (sessions.length === 0) return 0;
      const totalDuration = sessions.reduce(
        (sum, session) => sum + (session.durationMs || 0),
        0,
      );
      return Math.round(totalDuration / sessions.length);
    };

    const bioPageAverage = calculateAverage(bioPageSessions);
    const widgetAverage = calculateAverage(widgetSessions);
    const averageSessionTime = calculateAverage(records);

    // Get recent activity for the last 24 hours (hourly buckets)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVisits = await db.query.visitorAnalytics.findMany({
      where: and(
        eq(visitorAnalytics.chatbotId, chatbotId),
        eq(visitorAnalytics.event, "page_visit"), // Only count actual visits
        gte(visitorAnalytics.createdAt, last24Hours),
      ),
      columns: {
        createdAt: true,
        event: true,
      },
    });

    // Group recent activity by hour
    const recentActivity = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const visitsInHour = recentVisits.filter((visit) => {
        const visitTime = new Date(visit.createdAt);
        return visitTime >= hourStart && visitTime < hourEnd;
      }).length;

      recentActivity.push({
        timestamp: hourStart.toISOString(),
        visits: visitsInHour,
        chats: 0,
      });
    }

    return {
      totalVisits,
      activeVisitors,
      averageSessionTime,
      totalSessions: records.length,
      bioPageSessions: bioPageSessions.length,
      widgetSessions: widgetSessions.length,
      bioPageAverage,
      widgetAverage,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/analytics-stream",
).methods({
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

    let lastDataHash = "";

    const stream = new ReadableStream({
      start(controller) {
        const sendData = async () => {
          try {
            const data = await getAnalyticsData(chatbotId);
            const dataString = JSON.stringify(data);
            const currentHash = hashString(dataString);

            // Only send data if it has changed
            if (currentHash !== lastDataHash) {
              lastDataHash = currentHash;
              const message = `data: ${dataString}\n\n`;
              controller.enqueue(new TextEncoder().encode(message));
            }
          } catch (error) {
            console.error("Error getting analytics data:", error);
            const errorMessage = `data: ${JSON.stringify({ error: "Failed to fetch data" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorMessage));
          }
        };

        // Send initial data
        sendData();

        // Set up interval to check for updates every 5 seconds
        const interval = setInterval(sendData, 5000);

        // Cleanup function
        const cleanup = () => {
          clearInterval(interval);
          controller.close();
        };

        // Handle client disconnection
        request.signal?.addEventListener("abort", cleanup);

        // Cleanup after 5 minutes to prevent memory leaks
        setTimeout(cleanup, 5 * 60 * 1000);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
});

// Simple hash function to detect data changes
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}
