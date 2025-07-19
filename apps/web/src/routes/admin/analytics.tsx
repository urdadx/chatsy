import { ChatAnalytics } from "@/components/analytics/analytics-graph";
import { ChatsByCountry } from "@/components/analytics/chats-by-country";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-5xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <>
        <ChatAnalytics />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-6">
          <ChatsByCountry />
          <ChatsByCountry />
        </div>
        <div className="h-[14px]" />
      </>
    </div>
  );
}
