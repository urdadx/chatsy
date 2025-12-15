import { generateUUID } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatbots } from "./use-chatbot";

export const useChatWithReset = () => {
  // Generate a new chat ID on each mount to avoid reusing the same chat
  const [chatId, setChatId] = useState<string>(() => generateUUID());
  const [previousChatbotId, setPreviousChatbotId] = useState<string>("");
  const initializedRef = useRef(false);

  const { data: chatbotsData, isLoading } = useChatbots();
  const activeChatbot = chatbotsData?.activeChatbotId;

  useEffect(() => {
    if (typeof window !== "undefined" && activeChatbot) {
      const currentChatbotId = activeChatbot;

      // If chatbot changed, generate a new chat ID
      if (previousChatbotId && previousChatbotId !== currentChatbotId) {
        setChatId(generateUUID());
      }

      // Only set initial chat ID once per mount if not already set
      if (!initializedRef.current) {
        initializedRef.current = true;
      }

      setPreviousChatbotId(currentChatbotId);
    }
  }, [activeChatbot, previousChatbotId]);

  const resetChat = useCallback(() => {
    if (typeof window !== "undefined") {
      const newId = generateUUID();
      setChatId(newId);
    }
  }, []);

  const clearChatbotChats = useCallback(() => {
    // No-op since we no longer store chat IDs in localStorage
  }, []);

  return {
    chatId,
    resetChat,
    clearChatbotChats,
    isLoading,
    activeChatbot,
    chatbots: chatbotsData?.chatbots,
  };
};
