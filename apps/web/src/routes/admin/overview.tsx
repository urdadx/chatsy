import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { MyChatbots } from "@/components/dashboard/my-chatbots";
import { CompletedStatus } from "@/components/dashboard/training-status/completed-status";
import { FailedStatus } from "@/components/dashboard/training-status/failed-status";
import { InProgressStatus } from "@/components/dashboard/training-status/inprogress-status";
import Spinner from "@/components/ui/spinner";
import { useOverviewData } from "@/hooks/use-overview-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  // Use the custom hook that handles all data fetching and loading states
  const {
    trainingData,
    sourcesCount,
    voteCounts,
    conversationsCount,
    meter,
    visitorData,
    chatbotsData,
    isLoading,
  } = useOverviewData();

  const renderStatus = () => {
    switch (trainingData?.status) {
      case "completed":
        return <CompletedStatus />;
      case "failed":
        return <FailedStatus />;
      case "in-progress":
        return <InProgressStatus />;
      default:
        return <CompletedStatus />;
    }
  };

  // Show unified loading spinner
  if (isLoading) {
    return (
      <div className="relative p-6 w-full md:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <Spinner className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative p-6 w-full md:max-w-5xl xl:max-w-6xl mx-auto space-y-10">
        <DashboardMetrics
          sourcesCount={sourcesCount}
          conversationsCount={conversationsCount}
          voteCounts={voteCounts}
          meter={meter}
          visitorData={visitorData}
        />
        {renderStatus()}
        <MyChatbots chatbotsData={chatbotsData} />
      </div>
    </>
  );
}
