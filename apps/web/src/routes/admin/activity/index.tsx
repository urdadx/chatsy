import ActivityTable from "@/components/activity/activity-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/activity/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="max-w-5xl w-full max-h-screen mx-auto px-4 sm:px-0 py-4">
        <h1 className="text-xl font-semibold my-2 sm:flex">Leads</h1>
        <p className="text-muted-foreground">
          Monitor leads, issue reports and feedback from customers
        </p>
        <div className="py-4">
          <ActivityTable />
        </div>
      </div>
    </>
  );
}
