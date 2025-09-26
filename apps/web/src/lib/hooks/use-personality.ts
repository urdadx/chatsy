import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateChatbot } from "../server-functions/onboarding-queries";

export const useUpdatePersonality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personality: "support" | "sales" | "lead") => {
      return await updateChatbot({ data: { personality } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      toast.success("Personality updated successfully!");
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });
};
