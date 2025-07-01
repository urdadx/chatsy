import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useChatHistory = (filter = "24h") => {
  return useInfiniteQuery({
    queryKey: ["chat-logs", filter],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: PAGE_SIZE };

      if (filter && filter !== "all") {
        params.filter = filter;
      }

      if (pageParam) {
        params.startingAfter = pageParam;
      }

      const response = await api.get("/chat/history", { params });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.chats.length === 0) return undefined;
      return lastPage.chats[lastPage.chats.length - 1].id;
    },
  });
};
