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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAddQuestion } from "@/lib/hooks/use-add-question";
import { motion } from "framer-motion";
import { CirclePlus, InfoIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface FormData {
  question: string;
  answer: string;
  isSuggested: boolean;
}

export const AddQuestions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addQuestionMutation = useAddQuestion();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      question: "",
      answer: "",
      isSuggested: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addQuestionMutation.mutateAsync({
        question: data.question.trim(),
        answer: data.answer.trim(),
        isSuggested: data.isSuggested,
      });

      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add question:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add a question
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Add a Q&A</DialogTitle>
        </DialogHeader>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Question
            </Label>
            <Input
              id="question"
              autoFocus
              placeholder="Eg: When is the new product launching?"
              {...register("question", {
                required: "Question is required",
              })}
              className={errors.question ? "border-red-500" : ""}
            />
            {errors.question && (
              <span className="text-sm text-red-500">
                {errors.question.message}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="answer" className="text-sm font-medium">
              Answer
            </Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer"
              className={`w-full min-h-32 ${errors.answer ? "border-red-500" : ""}`}
              {...register("answer", {
                required: "Answer is required",
              })}
            />
            {errors.answer && (
              <span className="text-sm text-red-500">
                {errors.answer.message}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="isSuggested"
              control={control}
              render={({ field }) => (
                <Switch
                  id="suggestion"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="suggestion">Make this a suggestion</Label>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your bot will recommend this message to visitors</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex justify-end w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-purple-600 text-white"
                disabled={addQuestionMutation.isPending || !isValid}
              >
                {addQuestionMutation.isPending ? (
                  <>
                    Creating <Spinner />
                  </>
                ) : (
                  "Create Q&A"
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
