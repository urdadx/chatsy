import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SendVisitorAnalyticsOptions {
  chatbotId: string;
  extra?: Record<string, any>;
  triggerOnMount?: boolean;
  triggerOnUnmount?: boolean;
  onLog?: (data: any) => void;
}

interface VisitorData {
  id: string;
  isFirstVisit: boolean;
}

interface DeviceInfo {
  platform: string;
  deviceType: "Mobile" | "Tablet" | "Desktop";
}

interface VisitorHistoryResult {
  data: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isConnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getVisitorId = (): VisitorData => {
  let id = sessionStorage.getItem("padyna_visitor_id");
  const isFirstVisit = !id;

  if (!id) {
    id = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
    sessionStorage.setItem("padyna_visitor_id", id);
    localStorage.setItem("padyna_visitor_permanent_id", id);
  }

  localStorage.setItem("padyna_last_visit", Date.now().toString());
  return { id, isFirstVisit };
};

const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  let deviceType: "Mobile" | "Tablet" | "Desktop" = "Desktop";

  if (
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  ) {
    deviceType = /Tablet|iPad/i.test(ua) ? "Tablet" : "Mobile";
  }

  return {
    platform: navigator.platform,
    deviceType,
  };
};

// ============================================================================
// Main Hook
// ============================================================================

export function useSendVisitorAnalytics({
  chatbotId,
  extra = {},
  triggerOnMount = true,
  triggerOnUnmount = true,
  onLog,
}: SendVisitorAnalyticsOptions) {
  const mountTimestampRef = useRef<number>(Date.now());
  const eventCacheRef = useRef<Map<string, number>>(new Map());

  // Send analytics with automatic retry
  const sendAnalytics = useCallback(
    async (payload: any, retryCount = 0): Promise<void> => {
      if (onLog) onLog(payload);

      try {
        const response = await fetch("/api/visitor-analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
          keepalive: true,
        });

        if (!response.ok && retryCount < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1)),
          );
          return sendAnalytics(payload, retryCount + 1);
        }
      } catch (error) {
        if (
          retryCount < 2 &&
          error instanceof Error &&
          (error.name === "AbortError" || error.name === "TypeError")
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1)),
          );
          return sendAnalytics(payload, retryCount + 1);
        }
        console.error("Analytics error:", error);
      }
    },
    [onLog],
  );

  // Log analytics with deduplication
  const logVisitorAnalytics = useCallback(
    async (logExtra?: Record<string, any>) => {
      if (!chatbotId || chatbotId === "placeholder") return;

      const event = logExtra?.event || "unknown";
      const now = Date.now();

      // Deduplication: prevent same event within 2 seconds
      const lastEventTime = eventCacheRef.current.get(event);
      if (lastEventTime && now - lastEventTime < 2000) {
        return;
      }
      eventCacheRef.current.set(event, now);

      // Clean old cache entries
      if (eventCacheRef.current.size > 10) {
        const entries = Array.from(eventCacheRef.current.entries());
        eventCacheRef.current = new Map(entries.slice(-10));
      }

      const { id: visitorId } = getVisitorId();
      const deviceInfo = getDeviceInfo();

      // Location is now extracted from Cloudflare headers on the server
      const payload = {
        chatbotId,
        visitorId,
        userAgent: navigator.userAgent,
        deviceInfo,
        referer: document.referrer || null,
        event,
        durationMs: logExtra?.durationMs,
        extra: { ...extra, ...logExtra },
      };

      await sendAnalytics(payload);
    },
    [chatbotId, extra, sendAnalytics],
  );

  // Mount/unmount effects
  useEffect(() => {
    if (triggerOnMount && chatbotId && chatbotId !== "placeholder") {
      logVisitorAnalytics({ event: "page_visit" });
    }

    const handleBeforeUnload = () => {
      if (triggerOnUnmount && mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        logVisitorAnalytics({ event: "page_unload", durationMs });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [chatbotId, triggerOnMount, triggerOnUnmount, logVisitorAnalytics]);

  return {
    logVisitorAnalytics,
    mountTimestampRef,
  };
}

// ============================================================================
// Real-time Visitor History Hook
// ============================================================================

export function useRealTimeVisitorHistory(
  filter: "24h" | "7d" | "30d" | "90d",
): VisitorHistoryResult {
  const queryClient = useQueryClient();
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const query = useQuery({
    queryKey: ["visitor-analytics", filter],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    queryFn: async () => {
      const { data } = await api.get("/visitor-analytics");
      if (!Array.isArray(data)) return [];

      const now = new Date();
      const startDate = new Date(now);

      const daysMap = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
      startDate.setDate(now.getDate() - daysMap[filter]);

      return data.filter((item) => {
        const createdAt = new Date(item.createdAt || item.date);
        return createdAt >= startDate;
      });
    },
  });

  const connectSSE = useCallback(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined")
      return;

    if (sseRef.current) sseRef.current.close();

    try {
      const eventSource = new EventSource("/api/analytics-stream");
      sseRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connected");
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && !parsed.error) {
            queryClient.invalidateQueries({ queryKey: ["visitor-analytics"] });
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      eventSource.onerror = () => {
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = 2 ** reconnectAttempts.current * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectSSE();
          }, delay);
        }
      };
    } catch (err) {
      console.error("EventSource error:", err);
    }
  }, [queryClient]);

  const disconnectSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") connectSSE();
    return () => disconnectSSE();
  }, [filter, connectSSE, disconnectSSE]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnectSSE();
      } else if (!sseRef.current) {
        connectSSE();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connectSSE, disconnectSSE]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isConnected:
      typeof window !== "undefined" &&
      sseRef.current?.readyState === EventSource.OPEN,
    reconnect: connectSSE,
    disconnect: disconnectSSE,
  };
}
