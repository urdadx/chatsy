import { getChatById } from "@/lib/server-functions/chat-queries";
import { useQuery } from "@tanstack/react-query";

export function useChat(chatId: string) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChatById({ data: chatId }),
    enabled: !!chatId,
  });
}
