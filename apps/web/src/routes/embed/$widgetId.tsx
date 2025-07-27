import { ChatWidget } from "@/components/chat/chat-widget";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/embed/$widgetId")({
  component: EmbedPage,
});

function EmbedPage() {
  const { widgetId } = Route.useParams();

  return (
    <>
      <ChatWidget embedToken={widgetId} isOpen={false} />
    </>
  );
}
