import { ChatAnalytics } from "@/components/analytics/analytics-graph";
import { ChatsByCountry } from "@/components/analytics/chats-by-country";
import { ChatsByDeviceSources } from "@/components/analytics/chats-by-device-sources";
import { ChatsByReferrers } from "@/components/analytics/chats-by-referers";
import Spinner from "@/components/ui/spinner";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import z from "zod";

export const timeRangeSchema = z.object({
  timeRange: z.enum(["24h", "7d", "30d", "90d"]).optional().default("24h"),
});

export const Route = createFileRoute("/admin/analytics")({
  component: RouteComponent,
  validateSearch: timeRangeSchema,
});

function RouteComponent() {
  const { timeRange } = useSearch({ from: "/admin/analytics" });
  const selectedTimeRange =
    (timeRange as "24h" | "7d" | "30d" | "90d") || "24h";

  // Use the custom hook that handles shared data fetching and loading states
  const { visitorData, isLoading } = useAnalyticsData(selectedTimeRange);

  // Show unified loading spinner
  if (isLoading) {
    return (
      <div className="max-w-5xl lg:max-w-6xl w-full max-h-screen mx-auto p-2 sm:p-6">
        <div className="flex items-center justify-center h-96">
          <Spinner className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl lg:max-w-6xl w-full max-h-screen mx-auto p-2 sm:p-6">
      <>
        <ChatAnalytics visitorData={visitorData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-6">
          <ChatsByCountry visitorData={visitorData} />
          <ChatsByReferrers visitorData={visitorData} />
          <ChatsByDeviceSources visitorData={visitorData} />
        </div>
        <div className="h-[14px]" />
      </>
    </div>
  );
}
