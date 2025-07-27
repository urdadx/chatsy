import { generateUUID } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

export const useChatWithResetEmbed = () => {
  const [chatId, setChatId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingId = localStorage.getItem("chatId");
      if (existingId) {
        setChatId(existingId);
      } else {
        const newId = generateUUID();
        localStorage.setItem("chatId", newId);
        setChatId(newId);
      }
    }
  }, []);

  const resetChat = useCallback(() => {
    if (typeof window !== "undefined") {
      const newId = generateUUID();
      localStorage.setItem("chatId", newId);
      setChatId(newId);
    }
  }, []);

  return { chatId, resetChat };
};
