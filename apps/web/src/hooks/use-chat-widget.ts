import type { Chatbot } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";

// Custom chatbot fetcher for embedded widgets
const fetchEmbeddedChatbot = async (embedToken: string): Promise<Chatbot> => {
  const response = await fetch(`/api/embed/chatbot/${embedToken}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chatbot: ${response.status}`);
  }

  return response.json();
};

export function useChatWidget(embedToken: string) {
  return useQuery<Chatbot>({
    queryKey: ["embedded-chatbot", embedToken],
    queryFn: () => fetchEmbeddedChatbot(embedToken),
    retry: 1,
    enabled: !!embedToken,
  });
}
