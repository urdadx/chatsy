import { ChatPreview } from "@/components/chat/chat-preview";
import { ChatbotSettings } from "@/components/chatbot-settings/chatbot-settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Main content */}
      <div className="h-full overflow-y-auto pr-[420px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-2">Playground</h1>
            <p className="text-muted-foreground">
              Preview and configure your chatbot's behavior and styling
            </p>
          </div>

          <ChatbotSettings />
        </div>
      </div>

      {/* Fixed Sidebar */}
      <aside className="fixed top-0 right-0 w-[420px] h-full border-l bg-background px-4 py-6 z-20">
        <div className="h-full flex items-center justify-center">
          <ChatPreview />
        </div>
      </aside>
    </div>
  );
}
