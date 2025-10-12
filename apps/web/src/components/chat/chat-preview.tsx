import type { Vote } from "@/db/schema";
import { useChat as useChatData } from "@/hooks/use-chat";
import { useChatWithReset } from "@/hooks/use-chat-reset";
import { useChatbot } from "@/hooks/use-chatbot";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatBody } from "./chat-body";
import { ChatFooter } from "./chat-footer";
import { ChatHeader } from "./chat-header";
import { ChatLanding } from "./chat-landing";
import { convertToUIMessages } from "./convert-to-ui-message";

export function ChatPreview() {
  const { chatId, resetChat } = useChatWithReset();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
  const { data: chatData } = useChatData(chatId);
  const [input, setInput] = useState("");
  const [showLanding, setShowLanding] = useState(() => {
    return localStorage.getItem("chat-preview-interface") === "landing";
  });

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const {
    messages,
    sendMessage,
    status,
    setMessages,
    regenerate,
    error: chatError,
  } = useChat<ChatMessage>({
    id: chatId,
    transport: new DefaultChatTransport({
      fetch: fetchWithErrorHandlers,
      api: "/api/chat/",
    }),
    messages: initialMessages,
    experimental_throttle: 100,
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        console.error("Chat error:", error);
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({
        queryKey: ["active-meters"],
      });
    },
  });

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleResetChat = useCallback(() => {
    resetChat();
    setInput("");
    toast.success("Chat reset successfully");
    queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  }, [resetChat, setInput, queryClient]);

  const handleGoToMain = useCallback(() => {
    localStorage.setItem("chat-preview-interface", "chat");
    setShowLanding(false);
  }, []);

  const handleBackToLanding = useCallback(() => {
    localStorage.setItem("chat-preview-interface", "landing");
    setShowLanding(true);
  }, []);

  const { data: chatbot } = useChatbot();

  const SUGGESTIONS = chatbot?.suggestedMessages || [];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showPoweredBy = !chatbot?.hidePoweredBy;

  const { data: votes }: { data: Array<Vote> | undefined } = useQuery({
    queryKey: ["votes", chatId],
    queryFn: () =>
      fetchWithErrorHandlers(`/api/vote?chatId=${chatId}`).then((res) =>
        res.json(),
      ),
    enabled: messages.length >= 2,
  });

  if (showLanding) {
    return (
      <div className="bg-white flex flex-col w-full h-full max-h-[80vh] md:h-[550px] shadow-sm md:rounded-2xl overflow-hidden">
        <ChatLanding
          onGoToMain={handleGoToMain}
          chatbot={chatbot}
          className="h-full rounded-2xl"
        />
      </div>
    );
  }


  return (
    <div className="flex flex-col w-full h-full max-h-[80vh] md:h-[550px] shadow-sm md:rounded-2xl overflow-hidden">
      <ChatHeader
        chatbot={chatbot}
        onReset={handleResetChat}
        onBack={handleBackToLanding}
        showResetButton={true}
        showBackButton={true}
        resetIcon="refresh"
        className="rounded-t-2xl"
      />

      <ChatBody
        isLoading={isLoading}
        error={error}
        messages={messages}
        setMessages={setMessages}
        status={status}
        chatError={chatError}
        chatId={chatId}
        votes={votes}
        regenerate={regenerate}
        chatbot={chatbot}
        queryClient={queryClient}
        chatStatus={chatData?.status}
      />

      <ChatFooter
        input={input}
        onInputChange={(event) => setInput(event.target.value)}
        onSubmit={handleSubmit}
        status={status}
        suggestions={SUGGESTIONS}
        onSuggestionClick={handleSuggestionClick}
        showSuggestions={SUGGESTIONS.length > 0}
        showPoweredBy={showPoweredBy}
        chatbot={chatbot}
        placeholder="Chat with me..."
        className="bg-gray-50/40 space-y-2"
      />
    </div>
  );
}
