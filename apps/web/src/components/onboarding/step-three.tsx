import { useAddQuestion } from "@/lib/hooks/use-add-question";
import { containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export const StepThree = () => {
  const [questionText, setQuestionText] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestionMutation = useAddQuestion();
  const { nextStep, previousStep } = useStepperStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    await addQuestionMutation.mutateAsync({
      question: questionText.trim(),
      answer: answer.trim(),
    });
    nextStep();
    setIsSubmitting(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <form onSubmit={handleSubmit} className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              Common Questions
            </h1>
            <p className="text-start text-muted-foreground">
              What questions do your fans ask most?
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input
              autoFocus
              id="question"
              type="text"
              placeholder="ex: What mic do you use?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Shure MV7🎙️"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={previousStep}
              variant="outline"
              type="button"
              disabled={isSubmitting}
            >
              Previous
            </Button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
