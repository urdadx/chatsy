import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

export interface SendVisitorAnalyticsOptions {
  chatbotId: string;
  extra?: any;
  triggerOnMount?: boolean;
  triggerOnUnmount?: boolean;
  onLog?: (data: any) => void;
}

export function useSendVisitorAnalytics({
  chatbotId,
  extra = {},
  triggerOnMount = true,
  triggerOnUnmount = true,
  onLog,
}: SendVisitorAnalyticsOptions) {
  const mountTimestampRef = useRef<number | null>(null);
  const locationDataRef = useRef<any>(null);
  const locationFetchedRef = useRef<boolean>(false);
  const pendingRequestsRef = useRef<Set<string>>(new Set());
  const lastLogRef = useRef<{ event: string; timestamp: number } | null>(null);

  function getVisitorId() {
    let id = sessionStorage.getItem("chatsy_visitor_id");
    const isFirstVisit = !id;
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now();
      sessionStorage.setItem("chatsy_visitor_id", id);

      // Also store in localStorage to prevent duplicate visits across sessions
      localStorage.setItem("chatsy_visitor_permanent_id", id);
      localStorage.setItem("chatsy_last_visit", Date.now().toString());
    } else {
      // Update last visit time
      localStorage.setItem("chatsy_last_visit", Date.now().toString());
    }
    return { id, isFirstVisit };
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ) {
      if (/Tablet|iPad/i.test(ua)) return "Tablet";
      return "Mobile";
    }
    return "Desktop";
  }

  function getLocationInfo(cb: (location: any) => void) {
    // Only fetch location once per session
    if (locationFetchedRef.current) {
      cb(locationDataRef.current);
      return;
    }

    // Array of fallback APIs with different rate limits and capabilities
    const locationAPIs = [
      {
        name: "ipapi.co",
        url: "https://ipapi.co/json/",
        timeout: 3000,
        parser: (data: any) => ({
          city: data.city,
          region: data.region,
          country: data.country_name,
          country_code: data.country_code,
          continent: data.continent_code || data.continent || null,
          ip: data.ip,
        }),
      },
      {
        name: "ip-api.com",
        url: "http://ip-api.com/json/",
        timeout: 4000,
        parser: (data: any) => ({
          city: data.city,
          region: data.regionName,
          country: data.country,
          country_code: data.countryCode,
          continent: data.continentCode || "Africa",
          ip: data.query,
        }),
      },
      {
        name: "ipinfo.io",
        url: "https://ipinfo.io/json",
        timeout: 3000,
        parser: (data: any) => ({
          city: data.city,
          region: data.region,
          country: data.country,
          country_code: data.country,
          continent: "Africa",
          ip: data.ip,
        }),
      },
    ];

    async function tryLocationAPI(apiIndex = 0): Promise<void> {
      if (apiIndex >= locationAPIs.length) {
        console.warn(
          "All location APIs failed, proceeding without location data",
        );
        locationDataRef.current = null;
        locationFetchedRef.current = true;
        cb(null);
        return;
      }

      const api = locationAPIs[apiIndex];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout);

      try {
        console.debug(`Trying location API: ${api.name}`);

        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; Chatsy Analytics)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the API returned an error (some APIs return 200 but with error data)
        if (data.error || data.status === "fail") {
          throw new Error(
            data.error || data.message || "API returned error status",
          );
        }

        const locationData = api.parser(data);

        // Validate that we got meaningful data
        if (!locationData.country && !locationData.city) {
          throw new Error("No location data received");
        }

        console.debug(
          `Location fetched successfully from ${api.name}:`,
          locationData,
        );
        locationDataRef.current = locationData;
        locationFetchedRef.current = true;
        cb(locationData);
        return;
      } catch (error) {
        clearTimeout(timeoutId);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(`Location API ${api.name} failed:`, errorMessage);

        // Try next API after a brief delay to avoid hammering
        setTimeout(() => tryLocationAPI(apiIndex + 1), 200);
      }
    }

    // Start with the first API
    tryLocationAPI();
  }

  // Memoize sendAnalyticsData function to prevent unnecessary recreations
  const sendAnalyticsData = useCallback(
    (data: any, retryCount = 0) => {
      const maxRetries = 2;
      const retryDelay = Math.min(1000 * 2 ** retryCount, 5000); // Exponential backoff, max 5s

      console.debug("Sending visitor analytics data:", data);

      if (onLog) onLog(data);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      fetch("/api/visitor-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Chatsy Analytics Client",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        // Add request options for better reliability
        keepalive: true, // Ensure request completes even if page unloads
      })
        .then((response) => {
          clearTimeout(timeoutId);

          if (!response.ok) {
            // Log detailed error information
            console.error(
              "Failed to send visitor analytics:",
              response.status,
              response.statusText,
            );

            // Retry on server errors (5xx) but not client errors (4xx)
            if (response.status >= 500 && retryCount < maxRetries) {
              console.warn(
                `Retrying analytics request in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`,
              );
              setTimeout(() => {
                sendAnalyticsData(data, retryCount + 1);
              }, retryDelay);
              return;
            }

            return response.text().then((text) => {
              console.error("Response body:", text);
            });
          }

          console.debug("Visitor analytics sent successfully");

          // Since SSE handles real-time updates, we don't need manual invalidation
          // The SSE stream will automatically detect changes and invalidate queries
          // However, we can optionally invalidate immediately for instant feedback
          // This ensures even if SSE is temporarily disconnected, data stays fresh
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          // Retry on network errors if we haven't exceeded max retries
          if (
            retryCount < maxRetries &&
            (error.name === "AbortError" ||
              error.name === "TypeError" ||
              error.name === "NetworkError")
          ) {
            console.warn(
              `Network error, retrying analytics request in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries}):`,
              error.message,
            );
            setTimeout(() => {
              sendAnalyticsData(data, retryCount + 1);
            }, retryDelay);
          } else {
            console.error(
              "Error sending visitor analytics (final attempt):",
              error,
            );
          }
        });
    },
    [onLog],
  );

  // Memoize logVisitorAnalytics function to prevent unnecessary re-renders
  const logVisitorAnalytics = useCallback(
    (logExtra?: any) => {
      if (!chatbotId || chatbotId === "placeholder") {
        console.debug(
          "Visitor analytics not logged: invalid chatbotId",
          chatbotId,
        );
        return;
      }

      // Prevent duplicate logs within a short time window (deduplication)
      const now = Date.now();
      const event = logExtra?.event || "unknown";
      const requestKey = `${chatbotId}-${event}-${Math.floor(now / 5000)}`; // 5-second window

      if (pendingRequestsRef.current.has(requestKey)) {
        console.debug(`Skipping duplicate analytics log for ${event}`);
        return;
      }

      // Prevent rapid-fire logging of the same event type
      if (
        lastLogRef.current &&
        lastLogRef.current.event === event &&
        now - lastLogRef.current.timestamp < 2000
      ) {
        // 2s minimum between same events
        console.debug(`Rate limiting analytics log for ${event}`);
        return;
      }

      // For chat opened events, check if we've already logged this session
      if (event === "bubble_chat_opened") {
        const lastChatOpen = localStorage.getItem("chatsy_last_chat_opened");
        if (lastChatOpen && now - Number.parseInt(lastChatOpen) < 30000) {
          // 30 seconds
          console.debug(
            "Skipping duplicate chat opened event within 30 seconds",
          );
          return;
        }
        localStorage.setItem("chatsy_last_chat_opened", now.toString());
      }

      lastLogRef.current = { event, timestamp: now };
      pendingRequestsRef.current.add(requestKey);

      // Clean up old pending requests (prevent memory leak)
      setTimeout(() => {
        pendingRequestsRef.current.delete(requestKey);
      }, 5000);

      console.debug("Logging visitor analytics for organization:", chatbotId);

      const { id: visitorId, isFirstVisit } = getVisitorId();
      const userAgent = navigator.userAgent;
      const deviceInfo = {
        platform: navigator.platform,
        deviceType: getDeviceType(),
      };
      const referer = document.referrer || null;

      // Only fetch location for initial visits to minimize API calls
      const shouldFetchLocation =
        (logExtra?.event === "page_visit" ||
          logExtra?.event === "widget_opened") &&
        !locationFetchedRef.current;

      if (shouldFetchLocation) {
        getLocationInfo((location) => {
          sendAnalyticsData({
            chatbotId,
            visitorId,
            userAgent,
            deviceInfo,
            location,
            referer,
            isFirstVisit,
            ...extra,
            ...logExtra,
          });
        });
      } else {
        // Use cached location data or send without location
        sendAnalyticsData({
          chatbotId,
          visitorId,
          userAgent,
          deviceInfo,
          location: locationDataRef.current,
          referer,
          isFirstVisit,
          ...extra,
          ...logExtra,
        });
      }
    },
    [chatbotId, extra, sendAnalyticsData],
  );

  useEffect(() => {
    if (triggerOnMount && chatbotId && chatbotId !== "placeholder") {
      mountTimestampRef.current = Date.now();
      logVisitorAnalytics({ event: "page_visit" });
    }

    function handleBeforeUnload() {
      if (triggerOnUnmount && mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        // Use cached location data for unload events (no new API call)
        logVisitorAnalytics({ durationMs, event: "page_unload" });
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chatbotId, triggerOnMount, triggerOnUnmount]);

  // Expose for manual logging (e.g., on widget open/close)
  return {
    logVisitorAnalytics,
    mountTimestampRef,
  };
}

export function getVisitorHistory(filter: "24h" | "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["visitor-analytics", filter],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes instead of infinity
    queryFn: async () => {
      const { data } = await api.get("/visitor-analytics");
      if (!Array.isArray(data)) return [];

      const now = new Date();
      const startDate = new Date(now);
      if (filter === "24h") {
        startDate.setDate(now.getDate() - 1);
      } else if (filter === "7d") {
        startDate.setDate(now.getDate() - 7);
      } else if (filter === "30d") {
        startDate.setDate(now.getDate() - 30);
      } else if (filter === "90d") {
        startDate.setDate(now.getDate() - 90);
      }
      return data.filter((item) => {
        const createdAt = new Date(item.createdAt || item.date);
        return createdAt >= startDate;
      });
    },
  });
}

// Real-time visitor history hook that integrates with SSE
export function useRealTimeVisitorHistory(
  filter: "24h" | "7d" | "30d" | "90d",
): VisitorHistoryResult {
  const queryClient = useQueryClient();
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Use the existing query
  const query = useQuery({
    queryKey: ["visitor-analytics", filter],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fresh when using real-time updates
    queryFn: async () => {
      const { data } = await api.get("/visitor-analytics");
      if (!Array.isArray(data)) return [];

      const now = new Date();
      const startDate = new Date(now);
      if (filter === "24h") {
        startDate.setDate(now.getDate() - 1);
      } else if (filter === "7d") {
        startDate.setDate(now.getDate() - 7);
      } else if (filter === "30d") {
        startDate.setDate(now.getDate() - 30);
      } else if (filter === "90d") {
        startDate.setDate(now.getDate() - 90);
      }
      return data.filter((item) => {
        const createdAt = new Date(item.createdAt || item.date);
        return createdAt >= startDate;
      });
    },
  });

  const connectSSE = () => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      console.warn("EventSource not available in this environment");
      return;
    }

    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      const eventSource = new EventSource("/api/analytics-stream");
      sseRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established for visitor history");
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          // Check if there's new analytics data
          if (parsed && !parsed.error) {
            // Invalidate visitor analytics queries to trigger refetch
            queryClient.invalidateQueries({
              queryKey: ["visitor-analytics"],
            });
          }
        } catch (err) {
          console.error("Error parsing SSE data for visitor history:", err);
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE connection error for visitor history:", event);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = 2 ** reconnectAttempts.current * 1000; // 1s, 2s, 4s, 8s, 16s
          console.log(
            `Attempting to reconnect visitor history SSE in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectSSE();
          }, delay);
        } else {
          console.error(
            "Failed to connect visitor history SSE after multiple attempts",
          );
        }
      };
    } catch (err) {
      console.error("Error creating EventSource for visitor history:", err);
    }
  };

  const disconnectSSE = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Only connect SSE in browser environment
    if (typeof window !== "undefined") {
      connectSSE();
    }

    // Cleanup on unmount
    return () => {
      disconnectSSE();
    };
  }, [filter]); // Reconnect when filter changes

  // Visibility API to pause/resume connection when tab is hidden/visible
  useEffect(() => {
    // Only add visibility change listener in browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, disconnect to save resources
        disconnectSSE();
      } else {
        // Tab is visible again, reconnect
        if (!sseRef.current) {
          connectSSE();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

// Interface for consistent return type from visitor history hooks
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

// Helper hook that automatically chooses between static and real-time versions
export function useVisitorHistory(
  filter: "24h" | "7d" | "30d" | "90d",
  realTime = false,
): VisitorHistoryResult {
  if (realTime) {
    return useRealTimeVisitorHistory(filter);
  }

  // For static version, add isConnected: false to match the real-time interface
  const query = getVisitorHistory(filter);
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isConnected: false,
    reconnect: () => {},
    disconnect: () => {},
  };
}
