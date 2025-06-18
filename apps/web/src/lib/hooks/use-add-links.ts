// mutations/social-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addSocialLinks } from "../server-functions/onboarding-queries";

interface SocialLinkInput {
  platform: string;
  url: string;
  isConnected?: boolean;
}

export const useAddSocialLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (socialLinks: SocialLinkInput[]) => {
      return await addSocialLinks({ data: { socialLinks } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks"] });
    },
    onError: () => {
      toast.error("An error occured. Please try again.");
    },
  });
};
