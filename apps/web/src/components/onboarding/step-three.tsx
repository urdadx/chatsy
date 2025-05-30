import { containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export const StepThree = () => {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <form className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              Common Questions
            </h1>
            <p className="text-start  text-muted-foreground">
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
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" placeholder="Shure MV7🎙️" required />
          </div>
        </div>
      </form>
    </motion.div>
  );
};
