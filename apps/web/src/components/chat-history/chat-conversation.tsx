import { useChat } from "@/hooks/use-chat";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { useMessages } from "@/hooks/use-db-messages";
import { useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { convertToUIMessages } from "../chat/convert-to-ui-message";
import { PreviewMessage } from "../chat/preview-message";
import { TypingIndicator } from "../chat/typing-indicator";
import { Button } from "../ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "../ui/chat-container";
import { Input } from "../ui/input";
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
  const { data: chatData } = useChat(chatId || "");

  const messages = messagesFromDb ? convertToUIMessages(messagesFromDb) : [];
  const isEscalated = chatData?.status === "escalated";

  const [draft, setDraft] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const { status, isTyping, sendMessage, sendTyping, isConnected, connect } = useChatWebSocket({
    chatId: chatId || "",
    role: "agent",
    onError: (err) => console.error("WebSocket error:", err),
  });

  // Reset hasJoined when chatId changes
  useEffect(() => {
    setHasJoined(false);
    setDraft("");
  }, [chatId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If not joined yet, initiate websocket connection and mark as joined
    if (!hasJoined) {
      connect();
      setHasJoined(true);
      return;
    }

    // Send message
    if (!draft.trim() || !isConnected) return;
    const text = draft;
    setDraft("");
    sendTyping(false);
    sendMessage(text);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (e.target.value.trim() && hasJoined) {
      sendTyping(true);
    } else {
      sendTyping(false);
    }
  }, [sendTyping, hasJoined]);

  return (
    <div className="relative flex-1 h-full flex flex-col min-h-0">
      {/* Show message if chat is not escalated */}
      {!isEscalated && (
        <div className="border-b bg-yellow-50 dark:bg-yellow-950 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              This chat is not escalated. Only escalated chats support live agent communication.
            </span>
          </div>
        </div>
      )}

      {/* Status Header */}
      {hasJoined && isConnected && isEscalated && (
        <div className="border-b bg-green-50 dark:bg-green-950 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-green-700 dark:text-green-300">
              You are now live with the user
            </span>
          </div>
        </div>
      )}

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
                      showToolDetails={true}
                    />
                  </div>
                ))}
                {isTyping && (
                  <TypingIndicator
                    label="User is typing..."
                    className="px-1"
                  />
                )}
                <ChatContainerScrollAnchor />
              </div>
            )}
          </div>
        </ChatContainerContent>
        <div className="pointer-events-none absolute bottom-4 right-4 z-10">
          <ScrollButton className="shadow-lg pointer-events-auto" />
        </div>
      </ChatContainerRoot>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex gap-2 items-center"
      >
        {!hasJoined && isEscalated ? (
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              This chat has been escalated. Click "Join" to start assisting the user.
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={status === "connecting"}
            >
              {status === "connected"
                ? "Join Chat"
                : status === "connecting"
                  ? "Joining..."
                  : status === "error"
                    ? "Join (Retry)"
                    : "Join Chat"}
            </Button>
          </div>
        ) : isEscalated ? (
          <>
            <div className="flex-1 flex items-center gap-2">
              {status !== "connected" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {status === "connecting" && (
                    <>
                      <Spinner className="size-3" />
                      <span>Connecting...</span>
                    </>
                  )}
                  {status === "error" && (
                    <span className="text-red-500">Connection error</span>
                  )}
                  {status === "disconnected" && (
                    <span className="text-yellow-600">Disconnected</span>
                  )}
                </div>
              )}
              <Input
                placeholder={hasJoined ? (isConnected ? "Type a message..." : "Connecting...") : "Click Join to start"}
                value={draft}
                onChange={handleInputChange}
                disabled={!isConnected || !hasJoined}
                className="flex-1"
              />
            </div>
            <Button type="submit" disabled={!hasJoined || !draft.trim() || !isConnected}>
              Send
            </Button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-2">
            This chat is not escalated
          </div>
        )}
      </form>
    </div>
  );
};
