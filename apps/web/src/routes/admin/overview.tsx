import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { MyWorkspaces } from "@/components/dashboard/my-workspaces";
import { CompletedStatus } from "@/components/dashboard/training-status/completed-status";
import { FailedStatus } from "@/components/dashboard/training-status/failed-status";
import { InProgressStatus } from "@/components/dashboard/training-status/inprogress-status";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["training-status"],
    queryFn: async () => {
      const response = await api.get<{ status: string }>("/training-status");
      return response.data;
    },
    refetchOnMount: true,
  });

  const renderStatus = () => {
    if (isLoading) {
      return <InProgressStatus />;
    }

    switch (data?.status) {
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

  return (
    <>
      <div className="relative p-6 w-full max-w-5xl mx-auto space-y-10">
        <DashboardMetrics />
        {renderStatus()}
        <MyWorkspaces />
      </div>
    </>
  );
}
