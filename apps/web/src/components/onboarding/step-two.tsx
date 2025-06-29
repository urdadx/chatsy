import { useUpdatePrimaryColor } from "@/lib/hooks/use-primary-color";
import { cn, containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { ColorPickerDialog } from "./pick-color-onboard";

export const StepTwo = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>("#8b5cf6");
  const updatePrimaryColorMutation = useUpdatePrimaryColor();

  const colors = [
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#f97316",
    "#ec4899",
  ];

  const { nextStep, previousStep } = useStepperStore();

  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
  };

  const handleContinue = async (color: string) => {
    await updatePrimaryColorMutation.mutateAsync(color);
    nextStep();
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col h-full"
    >
      <div className="flex flex-col gap-6 pt-6 flex-1 min-h-[350px]">
        <div className="flex flex-col">
          <h1 className="text-2xl text-start font-semibold">Branding</h1>
          <p className="text-start text-muted-foreground">
            Customize your bot to your brand
          </p>
        </div>
        <div className="flex items-center gap-3">
          {colors.map((color, index) => (
            <button
              type="button"
              key={index}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-200",
                selectedColor === color && "ring-2 ring-offset-2",
                updatePrimaryColorMutation.isPending &&
                  "opacity-50 cursor-not-allowed",
              )}
              style={{
                backgroundColor: color,
              }}
              onClick={() => handleColorSelect(color)}
              disabled={updatePrimaryColorMutation.isPending}
            />
          ))}
          <ColorPickerDialog
            onColorSelect={handleColorSelect}
            isUpdating={updatePrimaryColorMutation.isPending}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" type="button" onClick={previousStep}>
          Previous
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => handleContinue(selectedColor || "#8b5cf6")}
            disabled={updatePrimaryColorMutation.isPending}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
