import type { Chatbot } from "@/db/schema";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useChatbot() {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  return useQuery<Chatbot>({
    queryKey: ["chatbot", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No active organization");
      }
      const response = await api.get("/my-chatbot", {
        params: { organizationId },
      });
      return response.data;
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });

      toast.success("Chatbot deleted successfully!");

      // If the deleted chatbot was active, refresh the page to update the UI
      if (data.wasActive) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error || "Failed to delete chatbot";
      toast.error(errorMessage);
    },
  });
}
