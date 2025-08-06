import { Pricing } from "@/components/landing-page/pricing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="bg-white">
      <Pricing />
    </main>
  );
}
