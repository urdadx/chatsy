// mutations/question-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addQuestion } from "../server-functions/onboarding-queries";

interface SingleQuestionInput {
  question: string;
  answer: string;
  isSuggested?: boolean;
}

export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: SingleQuestionInput) => {
      return await addQuestion({ data: questionData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });
};
