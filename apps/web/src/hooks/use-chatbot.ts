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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["chatbot"] });
      await queryClient.cancelQueries({ queryKey: ["chatbots"] });

      // Snapshot the previous values
      const previousChatbot = queryClient.getQueryData(["chatbot"]);
      const previousChatbots = queryClient.getQueryData(["chatbots"]);

      // Optimistically update chatbot query
      if (previousChatbot) {
        queryClient.setQueryData(["chatbot"], (old: any) => ({
          ...old,
          ...variables,
        }));
      }

      // Optimistically update chatbots query
      if (previousChatbots) {
        queryClient.setQueryData(["chatbots"], (old: any) => {
          if (!old?.chatbots || !old?.activeChatbotId) return old;

          return {
            ...old,
            chatbots: old.chatbots.map((chatbot: any) =>
              chatbot.id === old.activeChatbotId
                ? { ...chatbot, ...variables }
                : chatbot,
            ),
          };
        });
      }

      // Return a context object with the snapshotted values
      return { previousChatbot, previousChatbots };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousChatbot) {
        queryClient.setQueryData(["chatbot"], context.previousChatbot);
      }
      if (context?.previousChatbots) {
        queryClient.setQueryData(["chatbots"], context.previousChatbots);
      }
    },
    onSuccess: () => {
      // Force immediate refetch to ensure consistency with server and clear any Redis cache
      queryClient.refetchQueries({ queryKey: ["chatbot"] });
      queryClient.refetchQueries({ queryKey: ["chatbots"] });
      toast.success("Saved!");
    },
    onSettled: () => {
      // Always invalidate after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
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
      if (error.status === 400) {
        toast.warning(
          "This is the only chatbot in your organization so it can't be deleted.",
        );
      }
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

      toast.warning(errorData?.error || "Failed to create chatbot");
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
      toast.warning(error.response?.data?.error || "Failed to switch chatbot");
    },
  });
}
