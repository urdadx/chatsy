import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";

export interface ChatbotListItem {
  id: string;
  name: string;
  image?: string;
  primaryColor: string;
  createdAt: Date;
}

export interface ChatbotsResponse {
  chatbots: ChatbotListItem[];
  activeChatbotId: string | null;
}

export interface CreateChatbotData {
  name: string;
  primaryColor?: string;
  theme?: "light" | "dark";
  hidePoweredBy?: boolean;
  initialMessage?: string;
  suggestedMessages?: string[];
}

export interface SetActiveChatbotData {
  chatbotId: string;
}

// Hook to get all chatbots for the current organization
export function useChatbots() {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  return useQuery<ChatbotsResponse>({
    queryKey: ["chatbots", organizationId],
    queryFn: async () => {
      const response = await api.get("/chatbots");
      return response.data;
    },
    enabled: !!organizationId,
  });
}

// Hook to create a new chatbot
export function useCreateChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChatbotData) => {
      const response = await api.post("/my-chatbot", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      toast.success("Chatbot created successfully!");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;

      if (errorData?.reason === "limit_reached") {
        toast.error(
          "You have reached your chatbot limit. Please upgrade your plan or purchase additional chatbot add-ons.",
        );
        throw error;
      }

      toast.error(errorData?.error || "Failed to create chatbot");
    },
  });
}

// Hook to switch active chatbot
export function useSetActiveChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetActiveChatbotData) => {
      const response = await api.post("/set-active-chatbot", data);
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      toast.success(
        `Switched to ${response.chatbotName || "chatbot"} successfully!`,
      );
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to switch chatbot");
    },
  });
}
