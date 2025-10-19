import type { ActionType, Chatbot } from "@/db/schema";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

export function useChatbot() {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  return useQuery<Chatbot & { actions?: ActionType[] }>({
    queryKey: ["chatbot"],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No active organization");
      }
      const response = await api.get("/my-chatbot", {
        params: { organizationId },
      });
      return response.data as Chatbot & { actions?: ActionType[] };
    },
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Chatbot>) => {
      const response = await api.patch("/my-chatbot", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      toast.success("Saved!");
    },
  });
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatbotId: string) => {
      const response = await api.delete("/my-chatbot", {
        data: { chatbotId },
      });
      return response.data;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chatbot"] }),
        queryClient.invalidateQueries({ queryKey: ["chatbots"] }),
      ]);

      toast.success("Chatbot deleted successfully!");

      if (data.wasActive) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || "Failed to delete chatbot";
      toast.error(errorMessage);
    },
  });
}

// Hook to get all chatbots for the current organization
export function useChatbots() {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  return useQuery<ChatbotsResponse>({
    queryKey: ["chatbots"],
    queryFn: async () => {
      const response = await api.get("/chatbots");
      return response.data;
    },
    enabled: !!organizationId,
  });
}

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
