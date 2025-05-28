import { cn, containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { ColorPickerDialog } from "./pick-color-dialog";

export const StepTwo = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>("#8b5cf6");

  const colors = [
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#f97316",
    "#ec4899",
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col">
          <h1 className="text-2xl text-start font-semibold">Branding</h1>
          <p className="text-start  text-muted-foreground">
            Choose a color for your bot or add yours
          </p>
        </div>
        <div className="flex items-center gap-3 ">
          {colors.map((color, index) => (
            <button
              type="button"
              key={index}
              className={cn(
                "w-8 h-8 rounded-full ",
                selectedColor === color && "ring-2 ring-offset-2",
              )}
              style={{
                backgroundColor: color,
              }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
          <ColorPickerDialog />
        </div>
      </div>
    </motion.div>
  );
};
