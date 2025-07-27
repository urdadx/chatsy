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
    enabled: !!organizationId,
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Chatbot) => {
      const response = await api.patch("/my-chatbot", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      toast.success("Saved!");
    },
  });
}
