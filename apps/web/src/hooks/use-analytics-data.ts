import { getVisitorHistory } from "@/hooks/log-visitor-analytics";

/**
 * Custom hook that fetches shared analytics data for the analytics page
 * Provides a unified loading state and avoids duplicate API calls
 */
export function useAnalyticsData(timeRange: "24h" | "7d" | "30d" | "90d") {
  // Visitor analytics data - shared by all analytics components
  const { data: visitorData, isLoading: visitorDataLoading } =
    getVisitorHistory(timeRange);

  // Unified loading state
  const isLoading = visitorDataLoading;

  return {
    // Shared visitor data to pass down to components
    visitorData,

    // States
    isLoading,
  };
}
