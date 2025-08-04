import { convertToUIMessages } from "@/components/chat/chat-preview";
import { GreetingMessage } from "@/components/chat/greeting-message";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { AISuggestion, AISuggestions } from "@/components/ui/ai-suggestions";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Input } from "@/components/ui/input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Spinner } from "@/components/ui/spinner";
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
import { ArrowUp, SparklesIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/bubble/$embedToken")({
  component: RouteComponent,
});

function RouteComponent() {
  const { embedToken } = Route.useParams();
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
  } = useChatWidget(embedToken);

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

  const inputLength = input.trim().length;
  const organizationId = chatbot?.organizationId;

  // Track visitor analytics
  const { logVisitorAnalytics } = useSendVisitorAnalytics({
    organizationId: organizationId || "placeholder",
    extra: { page_type: "bubble_chat", embed_token: embedToken },
  });

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

  // Communicate with parent window
  const notifyParent = useCallback((type: string, data: any = {}) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, data }, "*");
    }
  }, []);

  // Clear unread count when widget opens
  useEffect(() => {
    notifyParent("chatsy-widget-opened");
    logVisitorAnalytics({ event: "bubble_chat_opened" });

    return () => {
      logVisitorAnalytics({ event: "bubble_chat_session_ended" });
    };
  }, [notifyParent, logVisitorAnalytics]);

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
    <div className="flex flex-col w-full h-[550px]  rounded-2xl overflow-hidden ">
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
        </div>
      </div>

      {/* Chat area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="p-3">
            {isLoading ? (
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
              <div className="space-y-3">
                {messages.length === 0 && (
                  <GreetingMessage title={greetingMessage} />
                )}

                {/* Render messages */}
                {messages.map((message, index) => (
                  <div key={message.id} className="w-full">
                    <PreviewMessage
                      chatId={chatId}
                      message={message}
                      isLoading={
                        isStreamingLastMessage && messages.length - 1 === index
                      }
                      vote={
                        votes
                          ? votes.find((vote) => vote.messageId === message.id)
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

          <div className="absolute bottom-2 right-2 z-10">
            <ScrollButton className="shadow-lg" />
          </div>
        </ChatContainerRoot>
      </div>

      {/* Footer */}
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
            className="flex-1 text-sm border-gray-200 focus:border-gray-300"
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
            className="rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              backgroundColor:
                inputLength > 0
                  ? chatbot?.primaryColor || "#2563eb"
                  : "#e5e7eb",
            }}
            type="submit"
            disabled={inputLength === 0}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4 text-white" />
          </button>
        </form>

        {showPoweredBy && (
          <div className="flex items-center justify-center text-xs text-gray-400">
            <span>Powered by </span>
            <a
              href="https://padyna.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: chatbot?.primaryColor || "#2563eb" }}
              className="ml-1 hover:underline font-medium"
            >
              Padyna
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
