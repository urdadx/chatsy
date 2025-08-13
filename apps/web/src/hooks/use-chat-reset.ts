import { generateUUID } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useChatbots } from "./use-chatbot-management";

export const useChatWithReset = () => {
  const [chatId, setChatId] = useState<string>("");
  const [previousChatbotId, setPreviousChatbotId] = useState<string>("");

  const { data: chatbotsData, isLoading } = useChatbots();
  const activeChatbot = chatbotsData?.activeChatbotId;

  const getChatStorageKey = useCallback((chatbotId: string) => {
    return `chatId_${chatbotId}`;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && activeChatbot) {
      const currentChatbotId = activeChatbot;

      // If chatbot changed, clear any temporary chat state
      if (previousChatbotId && previousChatbotId !== currentChatbotId) {
        setChatId("");
      }

      const storageKey = getChatStorageKey(currentChatbotId);
      const existingId = localStorage.getItem(storageKey);

      if (existingId) {
        setChatId(existingId);
      } else {
        const newId = generateUUID();
        localStorage.setItem(storageKey, newId);
        setChatId(newId);
      }

      setPreviousChatbotId(currentChatbotId);
    }
  }, [activeChatbot, getChatStorageKey, previousChatbotId]);

  const resetChat = useCallback(() => {
    if (typeof window !== "undefined" && activeChatbot) {
      const storageKey = getChatStorageKey(activeChatbot);
      const newId = generateUUID();
      localStorage.setItem(storageKey, newId);
      setChatId(newId);
    }
  }, [activeChatbot, getChatStorageKey]);

  const clearChatbotChats = useCallback(() => {
    if (typeof window !== "undefined" && activeChatbot) {
      const storageKey = getChatStorageKey(activeChatbot);
      localStorage.removeItem(storageKey);
    }
  }, [activeChatbot, getChatStorageKey]);

  return {
    chatId,
    resetChat,
    clearChatbotChats,
    isLoading,
    activeChatbot,
    chatbots: chatbotsData?.chatbots,
  };
};
