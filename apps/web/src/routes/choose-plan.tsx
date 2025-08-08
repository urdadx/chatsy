import { Pricing } from "@/components/landing-page/pricing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/choose-plan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-white">
      <Pricing />
    </main>
  );
}
