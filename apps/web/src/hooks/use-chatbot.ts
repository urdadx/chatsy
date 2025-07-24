import type { Chatbot } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useChatbot() {
  return useQuery<Chatbot>({
    queryKey: ["chatbot"],
    queryFn: async () => {
      const response = await api.get("/my-chatbot");
      return response.data;
    },
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
