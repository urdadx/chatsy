import { LeadsTable } from "@/components/leads-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/leads")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-4xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-md text-muted-foreground">
        Manage your leads, track their interactions, and convert them into
        customers.
      </span>
      <div className="py-6">
        <LeadsTable />
      </div>
    </div>
  );
}
