import { authClient } from "@/lib/auth-client";
import { generateUUID } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useChatWithReset = () => {
  const [chatId, setChatId] = useState<string>("");
  const [previousOrgId, setPreviousOrgId] = useState<string>("");

  const { data: activeOrganization, isLoading } = useQuery({
    queryKey: ["activeOrganization"],
    queryFn: async () => {
      const result = await authClient.organization.getFullOrganization();
      return result.data;
    },
  });

  const getChatStorageKey = useCallback((organizationId: string) => {
    return `chatId_${organizationId}`;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && activeOrganization?.id) {
      const currentOrgId = activeOrganization.id;

      // If organization changed, clear any temporary chat state
      if (previousOrgId && previousOrgId !== currentOrgId) {
        setChatId("");
      }

      const storageKey = getChatStorageKey(currentOrgId);
      const existingId = localStorage.getItem(storageKey);

      if (existingId) {
        setChatId(existingId);
      } else {
        const newId = generateUUID();
        localStorage.setItem(storageKey, newId);
        setChatId(newId);
      }

      setPreviousOrgId(currentOrgId);
    }
  }, [activeOrganization?.id, getChatStorageKey, previousOrgId]);

  const resetChat = useCallback(() => {
    if (typeof window !== "undefined" && activeOrganization?.id) {
      const storageKey = getChatStorageKey(activeOrganization.id);
      const newId = generateUUID();
      localStorage.setItem(storageKey, newId);
      setChatId(newId);
    }
  }, [activeOrganization?.id, getChatStorageKey]);

  const clearOrganizationChats = useCallback(() => {
    if (typeof window !== "undefined" && activeOrganization?.id) {
      const storageKey = getChatStorageKey(activeOrganization.id);
      localStorage.removeItem(storageKey);
    }
  }, [activeOrganization?.id, getChatStorageKey]);

  return {
    chatId,
    resetChat,
    clearOrganizationChats,
    isLoading,
    activeOrganization,
  };
};
