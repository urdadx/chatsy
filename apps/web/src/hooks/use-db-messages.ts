import { getMessagesByChatId } from "@/lib/server-functions/chat-queries";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch messages for a chat.
 * Real-time updates are handled by useChatWebSocket which invalidates
 * the ["messages", chatId] query when new messages arrive.
 */
export function useMessages(chatId: string) {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessagesByChatId({ data: chatId }),
    enabled: !!chatId,
  });
}
