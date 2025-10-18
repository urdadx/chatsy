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

    // Check if they haven't created an organization or verified their email after signing up
    if (!session.session.activeOrganizationId || !session.user.emailVerified) {
      throw redirect({ to: "/onboarding", search: location.search });
    }

    // Check if the user is subscribed (either personally or through organization membership)
    // Invited users inherit subscription status from the organization
    if (!session.user.isSubscribed) {
      throw redirect({ to: "/choose-plan", search: location.search });
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
