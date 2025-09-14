import { useEffect, useRef, useState } from "react";

export interface RealTimeAnalyticsData {
  totalVisits: number;
  averageSessionTime: number;
  activeVisitors: number;
  bioPageSessions: number;
  widgetSessions: number;
  bioPageAverage: number;
  widgetAverage: number;
  totalSessions: number;
  recentActivity: {
    timestamp: string;
    visits: number;
    chats: number;
  }[];
}

export function useRealTimeAnalytics() {
  const [data, setData] = useState<RealTimeAnalyticsData>({
    totalVisits: 0,
    averageSessionTime: 0,
    activeVisitors: 0,
    bioPageSessions: 0,
    widgetSessions: 0,
    bioPageAverage: 0,
    widgetAverage: 0,
    totalSessions: 0,
    recentActivity: [],
  });

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource("/api/analytics-stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          // Check if the response contains an error
          if (parsed.error) {
            setError(parsed.error);
          } else {
            // Validate that we have the expected data structure
            const newData = parsed as RealTimeAnalyticsData;
            setData(newData);
            setError(null);
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
          setError("Failed to parse analytics data");
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE connection error:", event);
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = 2 ** reconnectAttempts.current * 1000;
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setError(
            "Failed to connect to analytics stream after multiple attempts",
          );
        }
      };
    } catch (err) {
      console.error("Error creating EventSource:", err);
      setError("Failed to establish connection");
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Visibility API to pause/resume connection when tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, disconnect to save resources
        disconnect();
      } else {
        // Tab is visible again, reconnect
        if (!eventSourceRef.current) {
          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    data,
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  };
}

// Utility function to format duration in milliseconds to readable format
export function formatDuration(durationMs: number): string {
  if (durationMs === 0) return "0s";

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
