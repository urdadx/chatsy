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
import { motion } from "framer-motion";
import { CirclePlus, InfoIcon } from "lucide-react";
import { useState } from "react";

export const AddQuestions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add question
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Add question</DialogTitle>
        </DialogHeader>
        <form className="w-full space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              Question
            </label>
            <Input
              id="question"
              name="question"
              placeholder="Eg: When is the new product launching?"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="answer" className="text-sm font-medium">
              Answer
            </label>
            <Textarea
              id="answer"
              name="answer"
              placeholder="Enter the answer"
              className="w-full min-h-32"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="suggestion" checked={true} />
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
          <div className="flex w-full">
            <Button className="w-full" type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
