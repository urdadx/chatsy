import { ChatAnalytics } from "@/components/analytics/analytics-graph";
import { ChatsByCountry } from "@/components/analytics/chats-by-country";
import { ChatsByDeviceSources } from "@/components/analytics/chats-by-device-sources";
import { ChatsByReferrers } from "@/components/analytics/chats-by-referers";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const timeRangeSchema = z.object({
  timeRange: z.enum(["24h", "7d", "30d", "90d"]).optional().default("24h"),
});

export const Route = createFileRoute("/admin/analytics")({
  component: RouteComponent,
  validateSearch: timeRangeSchema,
});

function RouteComponent() {
  return (
    <div className="max-w-5xl w-full  max-h-screen mx-auto px-2 sm:px-0 py-4">
      <>
        <ChatAnalytics />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-6">
          <ChatsByCountry />
          <ChatsByReferrers />
          <ChatsByDeviceSources />
        </div>
        <div className="h-[14px]" />
      </>
    </div>
  );
}
