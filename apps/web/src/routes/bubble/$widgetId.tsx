import { ChatBody } from "@/components/chat/chat-body";
import { ChatFooter } from "@/components/chat/chat-footer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatLanding } from "@/components/chat/chat-landing";
import { convertToUIMessages } from "@/components/chat/convert-to-ui-message";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
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
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/bubble/$widgetId")({
  component: RouteComponent,
});

const ANALYTICS_EVENTS = {
  PAGE_VISIT: "page_visit",
  WIDGET_OPENED: "widget_opened",
  WIDGET_CLOSED: "widget_closed",
  WIDGET_PAGE_UNLOAD: "widget_page_unload",
} as const;

const MESSAGE_TYPES = {
  WIDGET_USER_OPENED: "padyna-widget-user-opened",
  PARENT_PAGE_UNLOAD: "parent-page-unload",
  WIDGET_CLOSE: "padyna-widget-close",
  PAGE_UNLOAD: "page_unload",
  WIDGET_PAGE_UNLOAD: "widget_page_unload",
  WIDGET_READY: "padyna-widget-ready",
  MESSAGE_RECEIVED: "padyna-message-received",
} as const;

const uiStateReducer = (state: any, action: any) => {
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

// Custom hook for logging analytics
const useAnalytics = (widgetId: string, chatbotId: string) => {
  const analyticsExtra = useMemo(
    () => ({
      page_type: "bubble_chat",
      embed_token: widgetId,
    }),
    [widgetId],
  );

  return useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: analyticsExtra,
    triggerOnMount: false,
    triggerOnUnmount: false,
  });
};

const useParentMessaging = (
  logVisitorAnalytics: any,
  mountTimestampRef: any,
) => {
  const notifyParent = useCallback((type: any, data = {}) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, data }, "*");
    }
  }, []);

  const logDurationEvent = useCallback(
    (event: any) => {
      if (mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        logVisitorAnalytics({
          durationMs,
          event,
          widget_type: "chat_widget",
        });
      }
    },
    [logVisitorAnalytics, mountTimestampRef],
  );

  useEffect(() => {
    const handleMessage = (event: any) => {
      const { type } = event.data || {};

      switch (type) {
        case MESSAGE_TYPES.WIDGET_USER_OPENED:
          mountTimestampRef.current = Date.now();
          logVisitorAnalytics({
            event: ANALYTICS_EVENTS.PAGE_VISIT,
            widget_type: "chat_widget",
          });
          logVisitorAnalytics({
            event: ANALYTICS_EVENTS.WIDGET_OPENED,
            widget_type: "chat_widget",
          });
          break;

        case MESSAGE_TYPES.PARENT_PAGE_UNLOAD:
          logDurationEvent(ANALYTICS_EVENTS.WIDGET_PAGE_UNLOAD);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [logVisitorAnalytics, logDurationEvent, mountTimestampRef]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      logDurationEvent(ANALYTICS_EVENTS.WIDGET_PAGE_UNLOAD);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [logDurationEvent]);

  return { notifyParent, logDurationEvent };
};

const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return { retryCount, retry };
};

const LoadingState = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="text-center">
      <Spinner className="text-primary mb-2" />
      <p className="text-gray-600">Loading chat...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: any) => (
  <div className="flex items-center justify-center h-full bg-red-50">
    <div className="text-center p-4">
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

function RouteComponent() {
  const { widgetId } = Route.useParams();
  const { chatId, resetChat } = useChatWithResetEmbed();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);
  const { retry } = useRetry();

  const [uiState, dispatchUiState] = useReducer(uiStateReducer, {
    input: "",
    isDeactivated: false,
    showLanding: localStorage.getItem(`bubble-${widgetId}-interface`) !== "chat",
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
  } = useChatWidget(widgetId);

  const { logVisitorAnalytics, mountTimestampRef } = useAnalytics(
    widgetId,
    chatbot?.id || "",
  );
  const { notifyParent, logDurationEvent } = useParentMessaging(
    logVisitorAnalytics,
    mountTimestampRef,
  );

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

        if (!response.ok && response.status === 403) {
          try {
            const errorData = await response.clone().json();
            if (errorData.error?.includes("offline")) {
              dispatchUiState({ type: "SET_DEACTIVATED", payload: true });
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }

        return response;
      },
      api: `/api/embed/chat/${widgetId}`,
    }),
    messages: initialMessages,
    onError: (error) => {
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
      notifyParent(MESSAGE_TYPES.MESSAGE_RECEIVED, {
        messageCount: messages.length + 1,
        isFromBot: false,
      });
    },
  });

  // Sync initial messages with chat messages
  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  // Memoized handlers
  const handleSubmit = useCallback(
    (event: any) => {
      event?.preventDefault();
      if (!uiState.input.trim()) return;

      sendMessage({ text: uiState.input });
      dispatchUiState({ type: "SET_INPUT", payload: "" });
    },
    [uiState.input, sendMessage],
  );

  const handleCloseWidget = useCallback(() => {
    logDurationEvent(ANALYTICS_EVENTS.WIDGET_CLOSED);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: MESSAGE_TYPES.WIDGET_CLOSE }, "*");
      window.parent.postMessage({ type: MESSAGE_TYPES.PAGE_UNLOAD }, "*");
      window.parent.postMessage(
        { type: MESSAGE_TYPES.WIDGET_PAGE_UNLOAD },
        "*",
      );
    }
  }, [logDurationEvent]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    dispatchUiState({ type: "SET_INPUT", payload: suggestion });
  }, []);

  const handleInputChange = useCallback((event: any) => {
    dispatchUiState({ type: "SET_INPUT", payload: event.target.value });
  }, []);

  const handleResetChat = useCallback(() => {
    resetChat();
    setMessages([]);
    dispatchUiState({ type: "RESET" });
  }, [resetChat, setMessages]);

  const handleGoToMain = useCallback(() => {
    localStorage.setItem(`bubble-${widgetId}-interface`, "chat");
    dispatchUiState({ type: "SET_SHOW_LANDING", payload: false });
  }, [widgetId]);

  const handleBackToLanding = useCallback(() => {
    localStorage.setItem(`bubble-${widgetId}-interface`, "landing");
    dispatchUiState({ type: "SET_SHOW_LANDING", payload: true });
  }, [widgetId]);

  const suggestions = useMemo(
    () => chatbot?.suggestedMessages || [],
    [chatbot?.suggestedMessages],
  );
  const showPoweredBy = useMemo(
    () => !chatbot?.hidePoweredBy,
    [chatbot?.hidePoweredBy],
  );

  const { data: votes } = useQuery({
    queryKey: ["votes", chatId],
    queryFn: () =>
      fetchWithErrorHandlers(`/api/vote?chatId=${chatId}`).then((res) =>
        res.json(),
      ),
    enabled: messages.length >= 2,
  });

  // Notify parent that widget is ready
  useEffect(() => {
    notifyParent(MESSAGE_TYPES.WIDGET_READY);
  }, [notifyParent]);

  if (chatbotError) {
    return <ErrorState error={chatbotError} onRetry={retry} />;
  }

  if (isChatbotLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col w-full h-screen md:h-[550px] md:rounded-2xl overflow-hidden">
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
            onClose={handleCloseWidget}
            onBack={handleBackToLanding}
            showResetButton={messages.length > 0}
            showCloseButton={true}
            showBackButton={true}
            resetIcon="rotate"
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
            className="w-full"
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
              placeholder="Type a message..."
            />
          )}
        </>
      )}
    </div>
  );
}
