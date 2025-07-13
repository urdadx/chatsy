import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { MyWorkspaces } from "@/components/dashboard/my-workspaces";
import { CompletedStatus } from "@/components/dashboard/training-status/completed-status";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="relative p-6 w-full max-w-5xl mx-auto space-y-10 ">
        <DashboardMetrics />
        <CompletedStatus />
        {/* <InProgressStatus /> */}
        {/* <FailedStatus /> */}
        <MyWorkspaces />
      </div>
    </>
  );
}
