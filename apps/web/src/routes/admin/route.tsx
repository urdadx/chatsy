import { AppSidebar } from "@/components/app-sidebar";
import { getSession } from "@/lib/auth-utils";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login", search: location.search });
    }
  },
});

function RouteComponent() {
  return (
    <>
      <AppSidebar />
    </>
  );
}
