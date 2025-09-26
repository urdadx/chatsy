import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateChatbot } from "../server-functions/onboarding-queries";

export const useUpdatePrimaryColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (primaryColor: string) => {
      return await updateChatbot({ data: { primaryColor } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot"] });
      toast.success("Primary color updated successfully!");
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });
};
