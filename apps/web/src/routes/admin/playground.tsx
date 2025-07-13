import { BrandingSettings } from "@/components/branding/branding-settings";
import { ChatPreview } from "@/components/chat-preview";
import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

const brandingSearchSchema = z.object({
  tab: z
    .enum(["chat-settings", "appearance"])
    .optional()
    .default("chat-settings"),
});

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
  validateSearch: brandingSearchSchema,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="mb-12 w-full sm:basis-3/5">
        <div className="max-w-xl mx-auto w-full p-4">
          <span className="text-md text-muted-foreground">
            Test your bot's responses and customize its appearance
          </span>

          <BrandingSettings />
        </div>
      </div>
      <div className="hidden lg:flex lg:basis-2/5 border-l bg-background fixed right-0 top-0 h-full p-6">
        <ChatPreview />
      </div>
    </div>
  );
}
