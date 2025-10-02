import { ChatBody } from "@/components/chat/chat-body";
import { ChatFooter } from "@/components/chat/chat-footer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatLanding } from "@/components/chat/chat-landing";
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
import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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
  const analyticsExtra = useMemo(
    () => ({
      page_type: "bio_page" as const,
      page_id: pageId,
    }),
    [pageId],
  );

  return useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: analyticsExtra,
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
      <p className="text-gray-600">Loading chat...</p>
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
  logVisitorAnalytics: (options: { event: string }) => void,
  pageId: string,
) => {
  const handleSubmit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!uiState.input.trim()) return;

      sendMessage({ text: uiState.input });
      dispatchUiState({ type: "SET_INPUT", payload: "" });
    },
    [uiState.input, sendMessage, dispatchUiState],
  );

  const handleResetChat = useCallback(() => {
    setMessages([]);
    dispatchUiState({ type: "RESET" });
    logVisitorAnalytics({ event: ANALYTICS_EVENTS.BIO_PAGE_CHAT_RESET });
  }, [setMessages, dispatchUiState, logVisitorAnalytics]);

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
    logVisitorAnalytics({ event: ANALYTICS_EVENTS.BIO_PAGE_CHAT_CLOSED });
  }, [logVisitorAnalytics]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      dispatchUiState({ type: "SET_INPUT", payload: suggestion });
    },
    [dispatchUiState],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatchUiState({ type: "SET_INPUT", payload: event.target.value });
    },
    [dispatchUiState],
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

function RouteComponent(): JSX.Element {
  const { pageId } = Route.useParams();
  const { chatId } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
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

  const { logVisitorAnalytics } = useAnalytics(pageId, chatbot?.id);

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

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

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
    logVisitorAnalytics,
    pageId,
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
      <div className="flex flex-col w-full max-w-[450px] overflow-hidden bg-white shadow-lg md:rounded-2xl mobile-full-height">
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
            />

            {!uiState.isDeactivated && (
              <ChatFooter
                input={uiState.input}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                status={status}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                showSuggestions={suggestions.length > 0}
                showPoweredBy={showPoweredBy}
                chatbot={chatbot}
                placeholder="Chat with me..."
                className="flex-shrink-0 space-y-2"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
