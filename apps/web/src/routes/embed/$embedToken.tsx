import { EmbeddedChatWidget } from "@/components/chat/embedded-chat-widget";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/embed/$embedToken")({
  component: EmbedPage,
});

function EmbedPage() {
  const { embedToken } = Route.useParams();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Widget starts minimized by default */}
      <EmbeddedChatWidget embedToken={embedToken} isOpen={false} />
    </div>
  );
}
