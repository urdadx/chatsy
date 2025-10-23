import { CalendlyIntegrationCard } from "@/components/integrations/calendly-card";
import { SlackCard } from "@/components/integrations/slack-card";
import { WhatsappIntegrationCard } from "@/components/integrations/whatsapp-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/integrations")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 sm:px-12 py-6 min-h-screen">
      <div className="w-full min-h-screen">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold  sm:flex">Platform Integrations</h2>
            {/* biome-ignore lint/a11y/useHeadingContent: <explanation> */}
            <h2 className="text-xl font-semibold flex sm:hidden"></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CalendlyIntegrationCard />
            <SlackCard />
            <WhatsappIntegrationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
