import { ChatHistory } from "@/components/chat-history/chat-history";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/chat-history/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="max-w-5xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
        <span className="text-md text-muted-foreground">
          View and manage your bot's chat history
        </span>
        <ChatHistory />
        <div className="h-[14px]" />
      </div>
    </>
  );
}
