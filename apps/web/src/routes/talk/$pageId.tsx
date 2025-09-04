import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
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
import { RiBardFill } from "@remixicon/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { ArrowUp, RefreshCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/talk/$pageId")({
  component: RouteComponent,
});

function RouteComponent() {
  // this is the chatbot's name
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
  const greetingMessage = chatbot?.initialMessage || "";

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
        <div
          className="flex items-center justify-between p-4 text-white border-b flex-shrink-0"
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
              <div className="rounded-full  w-9 h-9 flex items-center justify-center">
                <RiBardFill size={20} className="text-white rounded-full" />
              </div>
            )}
            <p className="font-normal text-base truncate">
              {chatbot?.name || "AI Assistant"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
            {/* Reset button */}
            <Button
              size="icon"
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Reset chat"
              variant="ghost"
              onClick={handleResetChat}
            >
              <RefreshCcw className="text-white" size={20} />
            </Button>
          </div>
        </div>

        {/* Chat area - Flexible height */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <ChatContainerRoot className="h-full smooth-div">
            <ChatContainerContent className="p-4 h-full">
              {isDeactivated ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 max-w-sm">
                    <div className="mb-4">
                      <div className="rounded-full  w-9 h-9 flex items-center justify-center">
                        <RiBardFill
                          size={20}
                          className="text-white rounded-full"
                        />
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
                <div className="flex items-center justify-center h-full">
                  <Spinner className="text-primary" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  <div>Error loading messages</div>
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
                      chatbot={chatbot}
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
            <div className="absolute bottom-4 right-4 z-10">
              <ScrollButton className="shadow-lg" />
            </div>
          </ChatContainerRoot>
        </div>

        {/* Footer - Fixed height */}
        {!isDeactivated && (
          <div className="border-t bg-gray-50/50 p-3 space-y-2 flex-shrink-0">
            {SUGGESTIONS.length > 0 && (
              <AISuggestions>
                {SUGGESTIONS.map((suggestion: string) => (
                  <AISuggestion
                    onClick={handleSuggestionClick}
                    key={suggestion}
                    suggestion={suggestion}
                  />
                ))}
              </AISuggestions>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Chat with me..."
                className="flex-1 text-sm bg-white sm:text-base"
                style={
                  {
                    "--tw-ring-color": chatbot?.primaryColor,
                  } as React.CSSProperties
                }
                autoComplete="off"
                autoFocus
                value={input}
                onChange={handleInputChange}
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
    </div>
  );
}
