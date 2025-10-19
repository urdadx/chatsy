import { ChatBody } from "@/components/chat/chat-body";
import { ChatFooter } from "@/components/chat/chat-footer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatLanding } from "@/components/chat/chat-landing";
import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import type { Vote } from "@/db/schema";
import { useChat as useChatData } from "@/hooks/use-chat";
import { useChatWithResetEmbed } from "@/hooks/use-chat-reset-embed";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { useChatWidget } from "@/hooks/use-chat-widget";
import { useMessages } from "@/hooks/use-db-messages";
import { useWidgetAnalytics } from "@/hooks/use-widget-analytics";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { Provider, useChat } from "@padyna/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/talk/$pageId")({
  component: RouteComponent,
});

const ANALYTICS_EVENTS = {
  BIO_PAGE_CHAT_RESET: "bio_page_chat_reset",
  BIO_PAGE_CHAT_CLOSED: "bio_page_chat_closed",
} as const;

interface UIState {
  input: string;
  isDeactivated: boolean;
  showLanding: boolean;
}

type UIAction =
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_DEACTIVATED"; payload: boolean }
  | { type: "SET_SHOW_LANDING"; payload: boolean }
  | { type: "RESET" };

interface ErrorData {
  error?: string;
}

const uiStateReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "SET_DEACTIVATED":
      return { ...state, isDeactivated: action.payload };
    case "SET_SHOW_LANDING":
      return { ...state, showLanding: action.payload };
    case "RESET":
      return { ...state, input: "" };
    default:
      return state;
  }
};

const useAnalytics = (pageId: string, chatbotId?: string) => {
  return useWidgetAnalytics({
    widgetId: pageId,
    chatbotId,
    pageType: "bio_page",
  });
};

const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { retryCount, retry };
};

const LoadingState: React.FC = () => (
  <div
    className="flex items-center justify-center"
    style={{ height: "calc(var(--vh, 1vh) * 100)" }}
  >
    <div className="text-center">
      <Spinner className="text-primary mb-2" />
    </div>
  </div>
);

interface ErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div
    className="flex items-center justify-center"
    style={{ height: "calc(var(--vh, 1vh) * 100)" }}
  >
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
      <p className="text-red-600 text-sm mb-2">
        {error?.message || "Failed to load chat widget"}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Try again
        </Button>
      )}
    </div>
  </div>
);

const useChatHandlers = (
  uiState: UIState,
  dispatchUiState: React.Dispatch<UIAction>,
  sendMessage: (options: { text: string }) => void,
  setMessages: (messages: any[]) => void,
  logEvent: (event: string, extraData?: Record<string, any>) => void,
  pageId: string,
  isEscalated: boolean,
  wsIsConnected: boolean,
  wsSendMessage?: (text: string) => boolean,
  wsSendTyping?: (typing: boolean) => void,
  queryClient?: any,
  chatId?: string,
  resetChat?: () => void,
) => {
  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!uiState.input.trim()) return;

      // If escalated, use WebSocket instead of AI SDK
      if (isEscalated && wsIsConnected && wsSendMessage) {
        console.log("Sending WebSocket message:", uiState.input);

        const success = wsSendMessage(uiState.input);
        if (success) {
          dispatchUiState({ type: "SET_INPUT", payload: "" });
          wsSendTyping?.(false);

          // For now, let database sync handle the user message display
          // The WebSocket will handle the agent's response in real-time
          queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
        } else {
          toast.error("Failed to send message. Please try again.");
        }
      } else if (!isEscalated) {
        sendMessage({ text: uiState.input });
        dispatchUiState({ type: "SET_INPUT", payload: "" });
      } else {
        toast.error("Connection not ready. Please wait...");
      }
    },
    [uiState.input, sendMessage, dispatchUiState, isEscalated, wsIsConnected, wsSendMessage, wsSendTyping],
  );

  const handleResetChat = useCallback(() => {
    resetChat?.();
    setMessages([]);
    dispatchUiState({ type: "RESET" });
    logEvent(ANALYTICS_EVENTS.BIO_PAGE_CHAT_RESET);
    queryClient?.invalidateQueries({ queryKey: ["messages"] });
    queryClient?.invalidateQueries({ queryKey: ["chat-logs"] });
  }, [resetChat, setMessages, dispatchUiState, logEvent, queryClient]);

  const handleGoToMain = useCallback(() => {
    localStorage.setItem(`talk-${pageId}-interface`, "chat");
    dispatchUiState({ type: "SET_SHOW_LANDING", payload: false });
  }, [dispatchUiState, pageId]);

  const handleBackToLanding = useCallback(() => {
    localStorage.setItem(`talk-${pageId}-interface`, "landing");
    dispatchUiState({ type: "SET_SHOW_LANDING", payload: true });
  }, [dispatchUiState, pageId]);

  const handleCloseChat = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
    logEvent(ANALYTICS_EVENTS.BIO_PAGE_CHAT_CLOSED);
  }, [logEvent]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      dispatchUiState({ type: "SET_INPUT", payload: suggestion });
    },
    [dispatchUiState],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatchUiState({ type: "SET_INPUT", payload: event.target.value });
      if (isEscalated && wsIsConnected && wsSendTyping) {
        if (event.target.value.trim()) {
          wsSendTyping(true);
        } else {
          wsSendTyping(false);
        }
      }
    },
    [dispatchUiState, isEscalated, wsIsConnected, wsSendTyping],
  );

  return {
    handleSubmit,
    handleResetChat,
    handleCloseChat,
    handleSuggestionClick,
    handleInputChange,
    handleGoToMain,
    handleBackToLanding,
  };
};

function TalkPageContent(): JSX.Element {
  const { pageId } = Route.useParams();
  const { chatId, resetChat } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
  const { data: chatData } = useChatData(chatId);
  const { retry } = useRetry();

  const [uiState, dispatchUiState] = useReducer(uiStateReducer, {
    input: "",
    isDeactivated: false,
    showLanding: localStorage.getItem(`talk-${pageId}-interface`) !== "chat",
  });

  const initialMessages = useMemo(
    () => (messagesFromDb ? convertToUIMessages(messagesFromDb) : []),
    [messagesFromDb],
  );

  const queryClient = useQueryClient();

  const {
    data: chatbot,
    isLoading: isChatbotLoading,
    error: chatbotError,
  } = useChatWidget(pageId);

  const { logEvent } = useAnalytics(pageId, chatbot?.id);

  const isEscalated = chatData?.status === "escalated";

  const {
    status: wsStatus,
    isTyping: wsIsTyping,
    sendMessage: wsSendMessage,
    sendTyping: wsSendTyping,
    connect: wsConnect,
    disconnect: wsDisconnect,
    isConnected: wsIsConnected,
  } = useChatWebSocket({
    chatId: chatId,
    role: "user",
    onError: () => {
      toast.error("Connection error");
    },
    onMessage: (message) => {
      const uiMessage = {
        id: message.id,
        role: (message.role === "human" ? "assistant" : message.role) as "user" | "assistant" | "system",
        parts: message.parts || [{ type: "text", text: message.parts?.[0]?.text || "" }],
        metadata: {
          createdAt: new Date(message.createdAt).toISOString(),
          originalRole: message.role,
        },
      };

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(msg => msg.id === uiMessage.id);
        if (messageExists) return prevMessages;

        return [...prevMessages, uiMessage];
      });
    },
  });

  // Auto-connect WebSocket when chat becomes escalated
  useEffect(() => {
    if (isEscalated && !wsIsConnected && wsStatus === "disconnected") {
      console.log("Chat escalated, connecting to WebSocket...");
      wsConnect();
    } else if (!isEscalated && wsIsConnected) {
      console.log("Chat no longer escalated, disconnecting WebSocket...");
      wsDisconnect();
    }
  }, [isEscalated, wsIsConnected, wsStatus, wsConnect, wsDisconnect]);

  const {
    messages,
    setMessages,
    status,
    sendMessage,
    regenerate,
    error: chatError,
  } = useChat<ChatMessage>({
    id: chatId,
    transport: new DefaultChatTransport({
      fetch: async (input: RequestInfo | URL, options?: RequestInit) => {
        const response = await fetchWithErrorHandlers(input, options);

        if (!response.ok && response.status === 403) {
          try {
            const errorData: ErrorData = await response.clone().json();
            if (errorData.error?.includes("offline")) {
              dispatchUiState({ type: "SET_DEACTIVATED", payload: true });
            }
          } catch (e) { }
        }

        return response;
      },
      api: `/api/embed/chat/${pageId}`,
    }),
    messages: initialMessages,
    experimental_throttle: 100,
    onError: (error: Error) => {
      if (!uiState.isDeactivated) {
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


  // Track the current chatId to prevent restoring messages after reset
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    // Only sync messages if we're on the same chat session
    // This prevents restoring old messages after a chat reset
    if (chatIdRef.current === chatId && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
    // Update the ref when chatId changes
    chatIdRef.current = chatId;
  }, [chatId, initialMessages, messages.length, setMessages]);

  const {
    handleSubmit,
    handleResetChat,
    handleCloseChat,
    handleSuggestionClick,
    handleInputChange,
    handleGoToMain,
    handleBackToLanding,
  } = useChatHandlers(
    uiState,
    dispatchUiState,
    sendMessage,
    setMessages,
    logEvent,
    pageId,
    isEscalated,
    wsIsConnected,
    wsSendMessage,
    wsSendTyping,
    queryClient,
    chatId,
    resetChat,
  );

  const suggestions = useMemo(
    () => chatbot?.suggestedMessages || [],
    [chatbot?.suggestedMessages],
  );
  const showPoweredBy = useMemo(
    () => !chatbot?.hidePoweredBy,
    [chatbot?.hidePoweredBy],
  );

  const { data: votes }: { data: Array<Vote> | undefined } = useQuery({
    queryKey: ["votes", chatId],
    queryFn: (): Promise<Vote[]> =>
      fetchWithErrorHandlers(`/api/vote?chatId=${chatId}`).then((res) =>
        res.json(),
      ),
    enabled: messages.length >= 2,
  });

  if (chatbotError) {
    return <ErrorState error={chatbotError} onRetry={retry} />;
  }

  if (isChatbotLoading) {
    return <LoadingState />;
  }

  return (
    <div
      className="flex items-center justify-center bg-muted md:p-4"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <div className="flex flex-col w-full max-w-[410px] overflow-hidden bg-white shadow-lg md:rounded-2xl mobile-full-height">
        {uiState.showLanding ? (
          <ChatLanding
            onGoToMain={handleGoToMain}
            chatbot={chatbot}
            className="h-full rounded-2xl"
          />
        ) : (
          <>
            <ChatHeader
              chatbot={chatbot}
              onReset={handleResetChat}
              onClose={handleCloseChat}
              onBack={handleBackToLanding}
              showResetButton={true}
              showCloseButton={true}
              showBackButton={true}
              resetIcon="refresh"
              className="flex-shrink-0"
            />

            <ChatBody
              isLoading={isLoading}
              error={error}
              isDeactivated={uiState.isDeactivated}
              messages={messages}
              setMessages={setMessages}
              status={status}
              chatError={chatError}
              chatId={chatId}
              votes={votes}
              regenerate={regenerate}
              chatbot={chatbot}
              className="h-full"
              chatStatus={chatData?.status}
              wsIsTyping={isEscalated && wsIsConnected ? wsIsTyping : undefined}
            />

            {!uiState.isDeactivated && (
              <ChatFooter
                input={uiState.input}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                status={isEscalated ? (wsIsConnected ? status : "submitted") : status}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                showSuggestions={suggestions.length > 0}
                showPoweredBy={showPoweredBy}
                chatbot={chatbot}
                placeholder={
                  isEscalated
                    ? wsIsConnected
                      ? "Type your message..."
                      : "Connecting to agent..."
                    : "Chat with me..."
                }
                className="flex-shrink-0 space-y-2"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RouteComponent(): JSX.Element {
  return (
    <Provider<ChatMessage> initialMessages={[]}>
      <TalkPageContent />
    </Provider>
  );
}
