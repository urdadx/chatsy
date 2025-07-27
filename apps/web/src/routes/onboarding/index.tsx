import { OnboardForm } from "@/components/onboarding/onboard-form";
import { getSession } from "@/lib/auth-utils";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/register", search: location.search });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] before:absolute before:-z-10 before:inset-0 before:bg-[radial-gradient(circle_at_left,rgba(236,72,153,0.05),rgba(139,92,246,0.05),transparent_50%)] after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle_at_right,rgba(236,72,153,0.05),rgba(139,92,246,0.05),transparent_50%)] p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <OnboardForm />
      </div>
    </div>
  );
}
