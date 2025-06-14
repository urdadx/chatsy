import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePrimaryColor } from "../server-functions/onboarding-queries";

export const useUpdatePrimaryColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (primaryColor: string) => {
      return await updatePrimaryColor({ data: { primaryColor } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
    },
    onError: () => {
      toast.error("An error occured. Please try again.");
    },
  });
};
