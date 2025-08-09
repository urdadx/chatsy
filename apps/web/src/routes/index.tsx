import { AddOns } from "@/components/landing-page/add-ons";
import { Pricing } from "@/components/landing-page/pricing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="bg-white space-y-14 pb-12">
      <Pricing />
      <AddOns />
    </main>
  );
}
