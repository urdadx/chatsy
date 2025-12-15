import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useChatHistory = (
  filter = "24h",
  status = "all",
  privacy = "all",
) => {
  return useInfiniteQuery({
    queryKey: ["chat-logs", filter, status, privacy],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: PAGE_SIZE };

      if (filter && filter !== "all") {
        params.filter = filter;
      }

      if (status && status !== "all") {
        params.status = status;
      }

      if (privacy && privacy !== "all") {
        params.privacy = privacy;
      }

      if (pageParam) {
        params.startingAfter = pageParam;
      }

      const response = await api.get("/chat/history", { params });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      // If hasMore is false or no chats returned, we're at the end
      if (!lastPage.hasMore || lastPage.chats.length === 0) return undefined;

      // If we got fewer chats than the page size, we're at the end
      if (lastPage.chats.length < PAGE_SIZE) return undefined;

      return lastPage.chats[lastPage.chats.length - 1].id;
    },
  });
};
