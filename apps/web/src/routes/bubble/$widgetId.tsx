import { ChatBody } from "@/components/chat/chat-body";
import { ChatFooter } from "@/components/chat/chat-footer";
import { ChatHeader } from "@/components/chat/chat-header";
import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import type { Vote } from "@/db/schema";
import { useSendVisitorAnalytics } from "@/hooks/log-visitor-analytics";
import { useChatWithResetEmbed } from "@/hooks/use-chat-reset-embed";
import { useChatWidget } from "@/hooks/use-chat-widget";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/bubble/$widgetId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { widgetId } = Route.useParams();
  const { chatId, resetChat } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
  const [input, setInput] = useState("");
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [hasLoggedFirstMessage, setHasLoggedFirstMessage] = useState(false);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const {
    data: chatbot,
    isLoading: isChatbotLoading,
    error: chatbotError,
  } = useChatWidget(widgetId);

  const {
    messages,
    setMessages,
    status,
    sendMessage,
    regenerate,
    error: chatError,
  } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      fetch: async (url, options) => {
        const response = await fetchWithErrorHandlers(url, options);

        // Check if the response indicates deactivation (status 403 with specific message)
        if (!response.ok && response.status === 403) {
          try {
            const errorData = await response.clone().json();
            if (errorData.error?.includes("offline")) {
              setIsDeactivated(true);
            }
          } catch (e) {
            // Ignore JSON parsing errors for error responses
          }
        }

        return response;
      },
      api: `/api/embed/chat/${widgetId}`,
    }),
    messages: initialMessages,
    experimental_throttle: 100,
    onError: (error) => {
      // Only show error toasts for non-deactivation errors
      if (!isDeactivated) {
        if (error instanceof ChatSDKError) {
          toast.error(error.message);
        } else {
          console.error("Chat error:", error);
          toast.error(
            error instanceof Error ? error.message : "An error occurred",
          );
        }
      }
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });

      // Notify parent window of new message
      notifyParent("padyna-message-received", {
        messageCount: messages.length + 1,
        isFromBot: false,
      });
    },
  });

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  const chatbotId = chatbot?.id;

  const analyticsExtra = useMemo(
    () => ({
      page_type: "bubble_chat",
      embed_token: widgetId,
    }),
    [widgetId],
  );

  const { logVisitorAnalytics } = useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: analyticsExtra,
    triggerOnMount: false,
  });

  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!input.trim()) return;

      // Log analytics only on first message
      if (!hasLoggedFirstMessage) {
        logVisitorAnalytics({ event: "page_visit" });
        setHasLoggedFirstMessage(true);
      }

      sendMessage({ text: input });
      setInput("");
    },
    [input, sendMessage, hasLoggedFirstMessage, logVisitorAnalytics],
  );

  const handleCloseWidget = useCallback(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "padyna-widget-close" }, "*");
      window.parent.postMessage({ type: "page_unload" }, "*");
    }
  }, []);

  const SUGGESTIONS = chatbot?.suggestedMessages || [];

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const showPoweredBy = !chatbot?.hidePoweredBy;

  const { data: votes }: { data: Array<Vote> | undefined } = useQuery({
    queryKey: ["votes", chatId],
    queryFn: () =>
      fetchWithErrorHandlers(`/api/vote?chatId=${chatId}`).then((res) =>
        res.json(),
      ),
    enabled: messages.length >= 2,
  });

  const notifyParent = useCallback((type: string, data: any = {}) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, data }, "*");
    }
  }, []);

  useEffect(() => {
    notifyParent("padyna-widget-opened");
  }, [notifyParent]);

  const handleResetChat = () => {
    resetChat();
    setMessages([]);
    setInput("");
    setHasLoggedFirstMessage(false); // Reset analytics tracking on chat reset
  };

  if (chatbotError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center p-4">
          <p className="text-red-600 text-sm">Failed to load chat widget</p>
        </div>
      </div>
    );
  }

  if (isChatbotLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen md:h-[550px] md:rounded-2xl overflow-hidden">
      <ChatHeader
        chatbot={chatbot}
        onReset={handleResetChat}
        onClose={handleCloseWidget}
        showResetButton={messages.length > 0}
        showCloseButton={true}
        resetIcon="rotate"
      >
        {/* Close button - only visible on mobile */}
        <Button
          size="icon"
          onClick={handleCloseWidget}
          className="md:hidden p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close chat"
          variant="ghost"
        >
          <X className="text-white" size={20} />
        </Button>
      </ChatHeader>

      <ChatBody
        isLoading={isLoading}
        error={error}
        isDeactivated={isDeactivated}
        messages={messages}
        setMessages={setMessages}
        status={status}
        chatError={chatError}
        chatId={chatId}
        votes={votes}
        regenerate={regenerate}
        chatbot={chatbot}
        className="w-full"
      />

      {!isDeactivated && (
        <ChatFooter
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          status={status}
          suggestions={SUGGESTIONS.slice(0, 3)}
          onSuggestionClick={handleSuggestionClick}
          showSuggestions={SUGGESTIONS.length > 0 && messages.length === 0}
          showPoweredBy={showPoweredBy}
          chatbot={chatbot}
          placeholder="Type a message..."
        />
      )}
    </div>
  );
}
