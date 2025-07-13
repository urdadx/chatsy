import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { motion } from "framer-motion";
import { CirclePlus, InfoIcon } from "lucide-react";

export const AddQuestions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSuggested, setIsSuggested] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/questions", {
        question,
        answer,
        isSuggested,
      });
    },
    onSuccess: () => {
      toast.success("Question added!");
      setQuestion("");
      setAnswer("");
      setIsSuggested(true);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to add question");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>Add a question</Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Add a Q&A</DialogTitle>
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
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
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
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
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
                {mutation.isPending ? "Creating..." : "Create Q&A"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
