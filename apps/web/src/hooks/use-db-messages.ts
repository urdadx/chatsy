import { getMessagesByChatId } from "@/lib/server-functions/chat-queries";
import { useQuery } from "@tanstack/react-query";

export function useMessages(chatId: string) {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessagesByChatId({ data: chatId }),
    enabled: !!chatId,
  });
}
