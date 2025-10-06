import { useMessages } from "@/hooks/use-db-messages";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react"; // added
import { convertToUIMessages } from "../chat/convert-to-ui-message";
import { PreviewMessage } from "../chat/preview-message";
import { Button } from "../ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "../ui/chat-container";
import { Input } from "../ui/input"; // added
import { ScrollButton } from "../ui/scroll-button";
import Spinner from "../ui/spinner";

export const ChatConversation = () => {
  const { chatId } = useSearch({ from: "/admin/chat-history/" });
  const {
    data: messagesFromDb,
    isLoading,
    error,
    refetch,
  } = useMessages(chatId || "");

  const messages = messagesFromDb ? convertToUIMessages(messagesFromDb) : [];

  const [draft, setDraft] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setDraft("");
  };

  return (
    <div className="relative flex-1 h-full flex flex-col min-h-0">
      {/* Scrollable messages area */}
      <ChatContainerRoot optimize className="flex-1 smooth-div relative">
        <ChatContainerContent className="p-4 space-y-4">
          <div className="w-full space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner className="text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-48 text-red-500">
                <div className="text-center space-y-2">
                  <div>Error loading messages</div>
                  <Button onClick={() => refetch()} variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages?.map((message) => (
                  <div key={message.id} className="w-full overflow-hidden p-1">
                    <PreviewMessage
                      chatId={chatId || ""}
                      message={message}
                      isLoading={false}
                      vote={undefined}
                      showActions={false}
                    />
                  </div>
                ))}
                <ChatContainerScrollAnchor />
              </div>
            )}
          </div>
        </ChatContainerContent>
        {/* Floating scroll button inside root (not affected by input height) */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10">
          <ScrollButton className="shadow-lg pointer-events-auto" />
        </div>
      </ChatContainerRoot>

      {/* Input bar (outside scroll container) */}
      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex gap-2 items-center"
      >
        <Input
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className=""
        />
        <Button type="submit" disabled={!draft.trim()}>Send</Button>
      </form>
    </div>
  );
};
