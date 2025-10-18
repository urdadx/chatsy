import { useRetrainingBanner } from "@/components/retraining-banner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

interface Question {
  id: string;
  question: string;
  answer: string;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export const EditQuestion = ({
  question,
  open,
  onOpenChange,
}: {
  question: Question;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [questionText, setQuestionText] = useState(question.question || "");
  const [answerText, setAnswerText] = useState(question.answer || "");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.patch("/questions", {
        id: question.id,
        question: questionText,
        answer: answerText,
      });
    },
    onSuccess: () => {
      toast.success("Question updated!");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setBanner(true, "Retraining required");
      localStorage.setItem("lastTrainedAt", new Date().toISOString());
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update question.");
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      mutation.mutate();
    },
    [mutation],
  );

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuestionText(e.target.value);
    },
    [],
  );

  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAnswerText(e.target.value);
    },
    [],
  );

  const formContent = (
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
          onChange={handleQuestionChange}
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
          onChange={handleAnswerChange}
        />
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
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit details</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[50%]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl">Edit details</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
};
