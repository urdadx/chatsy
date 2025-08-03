import { convertToUIMessages } from "@/components/chat/chat-preview";
import { GreetingMessage } from "@/components/chat/greeting-message";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Input } from "@/components/ui/input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Vote } from "@/db/schema";
import { useSendVisitorAnalytics } from "@/hooks/log-visitor-analytics";
import { useChatWithResetEmbed } from "@/hooks/use-chat-reset-embed";
import { useChatWidget } from "@/hooks/use-chat-widget";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  ChevronDown,
  MessageCircle,
  RefreshCcw,
  SparklesIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ChatWidgetProps {
  embedToken: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function ChatWidget({
  embedToken,
  isOpen = false,
  onToggle,
}: ChatWidgetProps) {
  const [isWidgetOpen, setIsWidgetOpen] = useState(isOpen);
  const {
    data: chatbot,
    isLoading: isChatbotLoading,
    error: chatbotError,
  } = useChatWidget(embedToken);

  const organizationId = chatbot?.organizationId || "";
  // Track visitor analytics with widget-specific data
  const { logVisitorAnalytics, mountTimestampRef } = useSendVisitorAnalytics({
    organizationId: organizationId || "placeholder",
    extra: {
      widget_type: "chat_widget",
      embed_token: embedToken,
      trigger_on_mount: false, // We'll manually track widget interactions
    },
    triggerOnMount: false, // Don't auto-trigger on mount for widgets
  });
  const { chatId } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const { messages, setMessages, status, handleSubmit, input, setInput } =
    useChat({
      id: chatId,
      initialMessages,
      fetch: fetchWithErrorHandlers,
      onError: (error) => {
        if (error instanceof ChatSDKError) {
          toast.error(error.message);
        }
      },
      api: `/api/embed/chat/${embedToken}`,
      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        // Track first message and widget engagement
        if (messages.length === 0) {
          logVisitorAnalytics({
            event: "widget_first_message_sent",
            widget_engagement: "first_message",
          });
        } else {
          logVisitorAnalytics({
            event: "widget_message_sent",
            widget_engagement: "continued_chat",
            message_count: messages.length + 1,
          });
        }
      },
    });

  const inputLength = input.trim().length;

  const handleToggleWidget = useCallback(() => {
    const newState = !isWidgetOpen;
    setIsWidgetOpen(newState);
    onToggle?.(newState);

    if (!isWidgetOpen && newState) {
      // Widget is being opened
      mountTimestampRef.current = Date.now();
      logVisitorAnalytics({
        event: "widget_opened",
        widget_state: "opened",
      });
    }

    if (isWidgetOpen && !newState && mountTimestampRef.current) {
      // Widget is being closed, log time spent
      const durationMs = Date.now() - mountTimestampRef.current;
      logVisitorAnalytics({
        durationMs,
        event: "widget_closed",
        widget_state: "closed",
      });
      mountTimestampRef.current = null;
    }
  }, [isWidgetOpen, onToggle, logVisitorAnalytics, mountTimestampRef]);

  // Log time spent if user closes page with widget open
  useEffect(() => {
    function handleBeforeUnload() {
      if (isWidgetOpen && mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        logVisitorAnalytics({
          durationMs,
          event: "widget_page_unload",
          widget_state: "open_on_unload",
        });
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isWidgetOpen, logVisitorAnalytics, mountTimestampRef]);

  const handleResetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
  }, [setMessages, setInput]);

  const isLastMessageFromUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreamingLastMessage = status === "streaming" && messages.length > 0;

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

  if (chatbotError) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <p className="text-red-600 text-sm">Failed to load chat widget</p>
        </div>
      </div>
    );
  }

  if (isChatbotLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className=" fixed bottom-4 z-1 right-4">
      {/* Chat Widget */}
      {isWidgetOpen && (
        <div className="mb-4">
          <Card className="w-[400px] h-[560px] shadow-xl border-1 py-0 animate-in slide-in-from-bottom-2 duration-300 flex flex-col">
            {/* Header */}
            <div
              className="p-4 text-white flex items-center justify-between border-b rounded-t-xl bg-primary"
              style={{ backgroundColor: chatbot?.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {chatbot?.image ? (
                  <img
                    src={chatbot.image}
                    alt="Assistant"
                    style={{
                      borderColor: chatbot?.primaryColor,
                    }}
                    className="rounded-full w-10 h-10"
                  />
                ) : (
                  <SparklesIcon size={17} />
                )}
                <p className="font-normal text-base">
                  {chatbot?.name || "Chat Widget"}
                </p>
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleResetChat}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span className="sr-only">Reset chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-primary" side="top">
                    Reset chat
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleToggleWidget}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-primary" side="top">
                    Close
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Make message area grow and scrollable */}
            <div className="relative flex-1 h-0 min-h-0 overflow-y-auto">
              <ChatContainerRoot className="h-full">
                <ChatContainerContent className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full text-red-500">
                      <div>Error loading messages</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <GreetingMessage title={greetingMessage} />
                      )}

                      {/* Render messages */}

                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className="w-full overflow-hidden p-1"
                        >
                          <PreviewMessage
                            chatId={chatId}
                            message={message}
                            isLoading={
                              isStreamingLastMessage &&
                              messages.length - 1 === index
                            }
                            vote={
                              votes
                                ? votes.find(
                                    (vote) => vote.messageId === message.id,
                                  )
                                : undefined
                            }
                            setMessages={setMessages}
                            chatbot={chatbot}
                          />
                        </div>
                      ))}

                      {status === "submitted" && isLastMessageFromUser && (
                        <ThinkingMessage />
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

            {/* Footer always at bottom */}
            <CardFooter className="flex flex-col space-y-2">
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
                  className="flex-1 text-sm sm:text-base"
                  style={
                    {
                      "--tw-ring-color": chatbot?.primaryColor,
                    } as React.CSSProperties
                  }
                  autoComplete="off"
                  autoFocus
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <Button
                  className="rounded-full"
                  style={{ backgroundColor: chatbot?.primaryColor }}
                  type="submit"
                  size="icon"
                  disabled={inputLength === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>

              {showPoweredBy ? (
                <div className="flex pt-1 pb-3 items-center justify-center text-xs text-muted-foreground">
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
                <div className="h-4" />
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      <div
        className={`flex items-end ${isWidgetOpen ? "justify-end" : "justify-center"}`}
      >
        <Button
          onClick={handleToggleWidget}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: chatbot?.primaryColor }}
          size="icon"
        >
          {isWidgetOpen ? (
            <ChevronDown className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          <span className="sr-only">
            {isWidgetOpen ? "Close chat" : "Open chat"}
          </span>
        </Button>
      </div>
    </div>
  );
}
