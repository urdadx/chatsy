import { getChatById } from "@/lib/server-functions/chat-queries";
import { useQuery } from "@tanstack/react-query";

export function useChat(chatId: string) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChatById({ data: chatId }),
    enabled: !!chatId,
    // Poll every 5 seconds to detect status changes (e.g., escalation)
    // This ensures users are notified when an agent escalates their chat
    refetchInterval: 5000,
    // Only poll when the window is focused to save resources
    refetchIntervalInBackground: false,
  });
}
