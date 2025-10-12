import { useRealTimeVisitorHistory } from "@/hooks/log-visitor-analytics";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useChatbots } from "@/hooks/use-chatbot-management";
import { useActiveMeters } from "@/hooks/use-usage-meters";
import { api } from "@/lib/api";
import { useQueries } from "@tanstack/react-query";

/**
 * Custom hook that fetches all data needed for the overview page
 * Provides a unified loading state and properly typed data
 */
export function useOverviewData() {
  const { data: chatHistoryData, isLoading: historyLoading } =
    useChatHistory("90d");
  const { data: meter, isLoading: metersLoading } = useActiveMeters();
  const { data: visitorData, isLoading: visitorsLoading } =
    useRealTimeVisitorHistory("90d");
  const { data: chatbotsData, isLoading: chatbotsLoading } = useChatbots();

  const apiData = useQueries({
    queries: [
      {
        queryKey: ["training-status"],
        queryFn: async () => {
          const response = await api.get<{ status: string }>(
            "/training-status",
          );
          return response.data;
        },
      },
      {
        queryKey: ["sources-count"],
        queryFn: async () => {
          const response = await api.get("/sources/count");
          return response.data.count;
        },
      },
      {
        queryKey: ["vote-counts"],
        queryFn: async () => {
          const response = await api.get("/vote-count");
          return response.data;
        },
      },
    ],
    combine: (results) => ({
      trainingData: results[0].data,
      sourcesCount: results[1].data,
      voteCounts: results[2].data,
      isLoading: results.some((result) => result.isLoading),
      isError: results.some((result) => result.isError),
      errors: results
        .filter((result) => result.error)
        .map((result) => result.error),
    }),
  });

  const conversationsCount = chatHistoryData?.pages.reduce(
    (acc, page) => acc + page.chats.length,
    0,
  );

  const isLoading =
    apiData.isLoading ||
    historyLoading ||
    metersLoading ||
    visitorsLoading ||
    chatbotsLoading;

  const isError = apiData.isError;

  return {
    trainingData: apiData.trainingData,
    sourcesCount: apiData.sourcesCount,
    voteCounts: apiData.voteCounts,
    conversationsCount,
    meter,
    visitorData,
    chatbotsData,
    isLoading,
    isError,
    errors: apiData.errors,
  };
}
