import type { Chatbot } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";

// Custom chatbot fetcher for embedded widgets
const fetchChatbot = async (identifier: string): Promise<Chatbot> => {
  const response = await fetch(`/api/embed/chatbot/${identifier}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chatbot: ${response.status}`);
  }

  return response.json();
};

export function useChatWidget(identifier: string) {
  return useQuery<Chatbot>({
    queryKey: ["embedded-chatbot", identifier],
    queryFn: () => fetchChatbot(identifier),
    retry: 1,
    enabled: !!identifier,
  });
}
