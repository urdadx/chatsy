import { useChat } from "@/hooks/use-chat";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { useMessages } from "@/hooks/use-db-messages";
import { useSession } from "@/lib/auth-client";
import { useSearch } from "@tanstack/react-router";
import { useCallback, useState } from "react";
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
import { InputEmojiPicker } from "../ui/input-emoji-picker";
import { SafeBoringAvatar } from "../ui/safe-boring-avatar";
import { ScrollButton } from "../ui/scroll-button";
import Spinner from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChatStatusHeader } from "./chat-status-header";

export const ChatConversation = () => {
  const { chatId } = useSearch({ from: "/admin/chat-history/" });
  const {
    data: messagesFromDb,
    isLoading,
    error,
    refetch,
  } = useMessages(chatId || "");
  const { data: chatData } = useChat(chatId || "");
  const { data: session } = useSession();

  const messages = messagesFromDb ? convertToUIMessages(messagesFromDb) : [];
  const isEscalated = (chatData as any)?.status === "escalated";

  // Check if chat is assigned to someone else
  const isAssignedToOther = !!(
    chatData?.assignedUser &&
    session?.user?.email &&
    chatData.assignedUser.email !== session.user.email
  );
  const assignedUserName = chatData?.assignedUser?.name || "Another agent";

  const [draft, setDraft] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const { status, isTyping, sendMessage, sendTyping, isConnected, connect, disconnect } = useChatWebSocket({
    chatId: chatId || "",
    role: "agent",
    onError: (err) => console.error("WebSocket error:", err),
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasJoined) {
      connect();
      setHasJoined(true);
      return;
    }

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

  const handleEndSession = useCallback(() => {
    disconnect();
    setHasJoined(false);
    setDraft("");
  }, [disconnect]);

  return (
    <div className="relative flex-1 h-full flex flex-col min-h-0">

      {/* Status Header */}
      {isEscalated && (
        <ChatStatusHeader
          status={status}
          hasJoined={hasJoined}
          isConnected={isConnected}
          onConnect={connect}
          onJoin={() => setHasJoined(true)}
          onEndSession={handleEndSession}
          isAssignedToOther={isAssignedToOther}
          assignedUserName={assignedUserName}
        />
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
                  <div className="flex items-center gap-2">
                    <SafeBoringAvatar name="user" size={32} className="mb-2" />
                    <TypingIndicator
                      label="User is typing..."
                      className="px-1"
                    />
                  </div>
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
          <>
            <div className="flex-1 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Input
                      placeholder={isAssignedToOther ? `${assignedUserName} has been assigned to this chat` : "Click Join to start messaging..."}
                      value=""
                      disabled={true}
                      className="flex-1"
                    />
                  </div>
                </TooltipTrigger>
                {isAssignedToOther && (
                  <TooltipContent>
                    {assignedUserName} has been assigned to this chat. You can't engage.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={status === "connecting" || isAssignedToOther}
                >
                  {status === "connected"
                    ? "Join chat"
                    : status === "connecting"
                      ? "Joining..."
                      : status === "error"
                        ? "Join (Retry)"
                        : "Join chat"}
                </Button>
              </TooltipTrigger>
              {isAssignedToOther && (
                <TooltipContent>
                  {assignedUserName} has been assigned to this chat. You can't engage.
                </TooltipContent>
              )}
            </Tooltip>
          </>
        ) : isEscalated ? (
          <>
            <div className="flex-1 flex items-center gap-1 bg-white rounded-md border border-input pr-1">
              <Input
                placeholder={hasJoined ? (isConnected ? "Type a message..." : "Connecting...") : "Click Join to start"}
                value={draft}
                onChange={handleInputChange}
                disabled={!isConnected || !hasJoined}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <InputEmojiPicker
                onEmojiSelect={(emoji) => {
                  setDraft((prev) => prev + emoji);
                  if (hasJoined) {
                    sendTyping(true);
                  }
                }}
                disabled={!isConnected || !hasJoined}
              />
            </div>
            <Button type="submit" disabled={!hasJoined || !draft.trim() || !isConnected}>
              Send
            </Button>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value=""
                    disabled={true}
                    className="flex-1"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                You can escalate the chat from the chat settings to join in.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" disabled={true}>
                  Send
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                You can escalate the chat from the chat settings to join in.
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </form>
    </div>
  );
};
