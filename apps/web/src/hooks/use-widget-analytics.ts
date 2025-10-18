import { useCallback, useMemo } from "react";
import { useSendVisitorAnalytics } from "./log-visitor-analytics";

interface UseWidgetAnalyticsOptions {
  widgetId: string;
  chatbotId?: string;
  pageType: "bubble_chat" | "bio_page";
}

/**
 * Simplified hook for widget/page analytics
 * Automatically handles mounting, unmounting, and provides clean event logging
 */
export function useWidgetAnalytics({
  widgetId,
  chatbotId,
  pageType,
}: UseWidgetAnalyticsOptions) {
  const analyticsExtra = useMemo(
    () => ({
      page_type: pageType,
      ...(pageType === "bubble_chat"
        ? { embed_token: widgetId }
        : { page_id: widgetId }),
    }),
    [widgetId, pageType],
  );

  const { logVisitorAnalytics, mountTimestampRef } = useSendVisitorAnalytics({
    chatbotId: chatbotId || "placeholder",
    extra: analyticsExtra,
    triggerOnMount: true,
    triggerOnUnmount: true,
  });

  const logDurationEvent = useCallback(
    (event: string, extraData?: Record<string, any>) => {
      if (mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        logVisitorAnalytics({
          event,
          durationMs,
          widget_type: pageType === "bubble_chat" ? "chat_widget" : undefined,
          ...extraData,
        });
      }
    },
    [logVisitorAnalytics, mountTimestampRef, pageType],
  );

  const logEvent = useCallback(
    (event: string, extraData?: Record<string, any>) => {
      logVisitorAnalytics({
        event,
        widget_type: pageType === "bubble_chat" ? "chat_widget" : undefined,
        ...extraData,
      });
    },
    [logVisitorAnalytics, pageType],
  );

  return {
    logEvent,
    logDurationEvent,
    mountTimestampRef,
  };
}
