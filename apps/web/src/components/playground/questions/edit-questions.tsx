import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const EditQuestion = ({
  question,
  open,
  onOpenChange,
}: {
  question: {
    id: string;
    question: string;
    answer: string;
    isSuggested?: boolean;
  };
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [questionText, setQuestionText] = useState(question.question || "");
  const [answerText, setAnswerText] = useState(question.answer || "");
  const [isSuggested, setIsSuggested] = useState(!!question.isSuggested);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.patch("/questions", {
        id: question.id,
        question: questionText,
        answer: answerText,
        isSuggested: isSuggested,
      });
    },
    onSuccess: () => {
      toast.success("Question updated!");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update question.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Edit Q&A</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Question
            </Label>
            <Input
              id="question"
              autoFocus
              name="question"
              placeholder="Eg: When is the new product launching?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="answer" className="text-sm font-medium">
              Answer
            </Label>
            <Textarea
              id="answer"
              name="answer"
              placeholder="Enter the answer"
              className="w-full min-h-32"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="suggestion"
              checked={isSuggested}
              onCheckedChange={setIsSuggested}
            />
            <Label htmlFor="suggestion">Make this a suggestion</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your bot will recommend this message to visitors</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex justify-end w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-purple-600 text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
