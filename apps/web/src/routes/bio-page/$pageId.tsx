import { convertToUIMessages } from "@/components/chat/chat-preview";
import { GreetingMessage } from "@/components/chat/greeting-message";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
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
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, RefreshCcw, SparklesIcon } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/bio-page/$pageId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pageId } = Route.useParams();
  const { chatId } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const {
    data: chatbot,
    isLoading: isChatbotLoading,
    error: chatbotError,
  } = useChatWidget(pageId);

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
      api: `/api/embed/chat/${pageId}`,
      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        // Track detailed message analytics
        if (messages.length === 0) {
          logVisitorAnalytics({
            event: "bio_first_message_sent",
            page_engagement: "first_message",
          });
        } else {
          logVisitorAnalytics({
            event: "bio_message_sent",
            page_engagement: "continued_chat",
            message_count: messages.length + 1,
          });
        }
      },
    });

  const inputLength = input.trim().length;
  const organizationId = chatbot?.organizationId;

  // Track visitor analytics with time spent
  const { logVisitorAnalytics } = useSendVisitorAnalytics({
    organizationId: organizationId || "placeholder",
    extra: { page_type: "bio_page", page_id: pageId },
  });

  const handleResetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
    logVisitorAnalytics({ event: "bio_page_chat_reset" });
  }, [setMessages, setInput, logVisitorAnalytics]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <p className="text-red-600 text-sm">Failed to load chat widget</p>
        </div>
      </div>
    );
  }

  if (isChatbotLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center  justify-center min-h-screen ">
      <Card className="w-[95%] max-w-lg h-[80vh] shadow-xl border-1 py-0 flex flex-col">
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
                <button
                  className="p-2 rounded-full hover:bg-white/10"
                  onClick={handleResetChat}
                  aria-label="Reset chat"
                  type="button"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary" side="top">
                Reset chat
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Chat area */}
        <div className="relative flex-1 h-0 min-h-0 overflow-y-hidden">
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
            <button
              className="rounded-full p-2"
              style={{ backgroundColor: chatbot?.primaryColor }}
              type="submit"
              disabled={inputLength === 0}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </button>
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
  );
}
