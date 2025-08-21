import { convertToUIMessages } from "@/components/chat/chat-preview";
import { GreetingMessage } from "@/components/chat/greeting-message";
import { Messages } from "@/components/chat/messages";
import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
import { Button } from "@/components/ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Input } from "@/components/ui/input";
import { ScrollButton } from "@/components/ui/scroll-button";
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
import { ArrowUp, RotateCcw, SparklesIcon, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
        // Check if the response indicates deactivation
        if (response.ok) {
          const data = await response.clone().json();
          if (data.deactivated) {
            setIsDeactivated(true);
            return new Response(
              JSON.stringify({ error: "Chatbot deactivated" }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              },
            );
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
      // Track analytics
      if (messages.length === 0) {
        logVisitorAnalytics({
          event: "bubble_first_message_sent",
          page_engagement: "first_message",
        });
      } else {
        logVisitorAnalytics({
          event: "bubble_message_sent",
          page_engagement: "continued_chat",
          message_count: messages.length + 1,
        });
      }

      // Notify parent window of new message
      notifyParent("chatsy-message-received", {
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

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  };

  const chatbotId = chatbot?.id;

  // Track visitor analytics
  const { logVisitorAnalytics } = useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: { page_type: "bubble_chat", embed_token: widgetId },
  });

  const handleCloseWidget = () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "chatsy-widget-close" }, "*");
    }
  };

  const SUGGESTIONS = chatbot?.suggestedMessages || [];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showPoweredBy = !chatbot?.hidePoweredBy;
  const greetingMessage = chatbot?.initialMessage || "";

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
    notifyParent("chatsy-widget-opened");
    logVisitorAnalytics({ event: "bubble_chat_opened" });

    return () => {
      logVisitorAnalytics({ event: "bubble_chat_session_ended" });
    };
  }, [notifyParent, logVisitorAnalytics]);

  const handleResetChat = () => {
    resetChat();
    setMessages([]);
    setInput("");
    logVisitorAnalytics({ event: "bubble_chat_reset" });
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
      <div
        className="flex items-center justify-between p-4 text-white border-b"
        style={{ backgroundColor: chatbot?.primaryColor || "#2563eb" }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {chatbot?.image ? (
            <img
              src={chatbot.image}
              alt="Assistant"
              className="rounded-full w-8 h-8 flex-shrink-0"
            />
          ) : (
            <div className="rounded-full w-8 h-8 bg-white/20 flex items-center justify-center flex-shrink-0">
              <SparklesIcon size={16} />
            </div>
          )}
          <p className="font-normal text-base">
            {chatbot?.name || "AI Assistant"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              size="icon"
              onClick={handleResetChat}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Reset chat"
              variant="ghost"
            >
              <RotateCcw className="text-white" size={16} />
            </Button>
          )}
          <Button
            size="icon"
            onClick={handleCloseWidget}
            className="md:hidden p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close chat"
            variant="ghost"
          >
            <X className="text-white" size={20} />
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div className="relative flex-1 min-h-0 overflow-y-hidden">
        <ChatContainerRoot className="w-full h-full smooth-div">
          <ChatContainerContent className="p-4">
            {isDeactivated ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-sm">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <SparklesIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chatbot Unavailable
                  </h3>
                  <p className="text-gray-600 text-sm">
                    This chatbot is currently deactivated. Please try again
                    later or contact support.
                  </p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="fixed inset-0 flex items-center justify-center bg-white">
                <Spinner className="text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                  <p className="text-sm">Error loading messages</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <GreetingMessage title={greetingMessage} />
                ) : (
                  <Messages
                    chatId={chatId}
                    status={status}
                    votes={votes}
                    messages={messages}
                    setMessages={setMessages}
                    reload={regenerate}
                  />
                )}

                {status === "error" && chatError && (
                  <div className="text-red-500 p-4">
                    Error: {chatError.message}
                  </div>
                )}

                <ChatContainerScrollAnchor />
              </div>
            )}
          </ChatContainerContent>

          <div className="absolute bottom-2 right-2 z-10">
            <ScrollButton className="shadow-lg" />
          </div>
        </ChatContainerRoot>
      </div>

      {/* Footer */}
      {!isDeactivated && (
        <div className="border-t bg-gray-50/50 p-3 space-y-3">
          {SUGGESTIONS.length > 0 && messages.length === 0 && (
            <div className="space-y-2">
              <AISuggestions>
                {SUGGESTIONS.slice(0, 3).map((suggestion: string) => (
                  <AISuggestion
                    onClick={handleSuggestionClick}
                    key={suggestion}
                    suggestion={suggestion}
                  />
                ))}
              </AISuggestions>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              id="message"
              placeholder="Type a message..."
              className="flex-1 text-sm bg-white sm:text-base"
              style={
                {
                  "--tw-ring-color": chatbot?.primaryColor || "#2563eb",
                } as React.CSSProperties
              }
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              className="rounded-full p-2"
              style={{ backgroundColor: chatbot?.primaryColor }}
              type="submit"
              disabled={status === "streaming" || status === "submitted"}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </button>
          </form>

          {showPoweredBy ? (
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <span>Powered by </span>
              <a
                href="https://padyna.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: chatbot?.primaryColor }}
                className="ml-1 hover:underline font-semibold"
              >
                Padyna
              </a>
            </div>
          ) : (
            <div className="h-0" />
          )}
        </div>
      )}
    </div>
  );
}
