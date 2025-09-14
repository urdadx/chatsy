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

export const Route = createFileRoute("/talk/$pageId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pageId } = Route.useParams();
  const { chatId } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
  const [input, setInput] = useState("");
  const [isDeactivated, setIsDeactivated] = useState(false);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const {
    data: chatbot,
    isLoading: isChatbotLoading,
    error: chatbotError,
  } = useChatWidget(pageId);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

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
      api: `/api/embed/chat/${pageId}`,
    }),
    messages: initialMessages,
    experimental_throttle: 100,
    onError: (error) => {
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
      page_type: "bio_page",
      page_id: pageId,
    }),
    [pageId],
  );

  const { logVisitorAnalytics } = useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: analyticsExtra,
  });

  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!input.trim()) return;

      sendMessage({ text: input });
      setInput("");
    },
    [input, sendMessage, messages.length, logVisitorAnalytics],
  );

  const handleResetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
    logVisitorAnalytics({ event: "bio_page_chat_reset" });
  }, [setMessages, setInput, logVisitorAnalytics]);

  const handleCloseChat = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
    logVisitorAnalytics({ event: "bio_page_chat_closed" });
  }, [logVisitorAnalytics]);

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

  if (chatbotError) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <p className="text-red-600 text-sm">Failed to load chat widget</p>
        </div>
      </div>
    );
  }

  if (isChatbotLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center bg-muted md:p-4"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <div className="flex flex-col w-full max-w-[500px] overflow-hidden bg-white shadow-lg md:rounded-2xl mobile-full-height">
        <ChatHeader
          chatbot={chatbot}
          onReset={handleResetChat}
          onClose={handleCloseChat}
          showResetButton={true}
          showCloseButton={true}
          resetIcon="refresh"
          className="flex-shrink-0"
        >
          {/* Close button - only visible on mobile */}
          <Button
            size="icon"
            className="p-1 hover:bg-white/10 rounded-full transition-colors md:hidden"
            aria-label="Close chat"
            variant="ghost"
            onClick={handleCloseChat}
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
          className="h-full"
        />

        {!isDeactivated && (
          <ChatFooter
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            status={status}
            suggestions={SUGGESTIONS}
            onSuggestionClick={handleSuggestionClick}
            showSuggestions={SUGGESTIONS.length > 0}
            showPoweredBy={showPoweredBy}
            chatbot={chatbot}
            placeholder="Chat with me..."
            className="flex-shrink-0 space-y-2"
          />
        )}
      </div>
    </div>
  );
}
