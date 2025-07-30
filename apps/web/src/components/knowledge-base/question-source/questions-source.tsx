import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { QuestionList } from "./question-list";

export const QuestionSource = () => {
  const queryClient = useQueryClient();
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");

  const addQuestionMutation = useMutation({
    mutationFn: async (newQuestion: { question: string; answer: string }) => {
      const response = await api.post("/questions", newQuestion);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setQuestionText("");
      setAnswerText("");
      toast.success("Question added successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to add question: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim() && answerText.trim()) {
      addQuestionMutation.mutate({
        question: questionText,
        answer: answerText,
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 rounded-md p-8 border">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="font-semibold text-lg">Q&A</h2>
          <p className="text-semibold text-base text-muted-foreground">
            Create answers for key questions to help your AI Agent provide the
            most useful information
          </p>
        </div>

        <form className="flex flex-col " onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div className="w-full flex flex-col gap-2">
              <Label className="text-sm" htmlFor="question">
                Question
              </Label>
              <Input
                className="w-full text-base"
                placeholder="Ex: Do you do refunds? "
                type="text"
                name="question"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm" htmlFor="answer">
                Answer
              </Label>
              <Textarea
                className="text-sm"
                rows={6}
                required
                placeholder="Enter your answer here"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="w-fit"
              type="submit"
              disabled={addQuestionMutation.isPending}
            >
              {addQuestionMutation.isPending ? "Adding..." : "Add Q&A source"}
            </Button>
          </div>
        </form>
      </div>

      <QuestionList />
    </>
  );
};
