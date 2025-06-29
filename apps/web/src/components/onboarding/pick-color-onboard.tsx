import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Palette } from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface ColorPickerDialogProps {
  onColorSelect: (color: string) => void;
  isUpdating: boolean;
}

export const ColorPickerDialog = ({
  onColorSelect,
  isUpdating,
}: ColorPickerDialogProps) => {
  const [color, setColor] = useState("#6366f1");
  const [hexInput, setHexInput] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  const isValidHex = (hex: string) => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const normalizeHex = (hex: string) => {
    let normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (normalized.length === 4) {
      normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }
    return normalized.toUpperCase();
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      const normalized = normalizeHex(value);
      setColor(normalized);
    }
  };

  const handleConfirmColor = async () => {
    if (isValidHex(hexInput)) {
      const normalizedColor = normalizeHex(hexInput);
      await onColorSelect(normalizedColor);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          style={{
            backgroundColor: color,
          }}
          className="w-8 h-8 rounded-full"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex text-md items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Pick a color
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <HexColorPicker
                color={color}
                onChange={handleColorChange}
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="hex-input"
              className="text-sm font-medium text-gray-700"
            >
              Or type the color code here👇
            </Label>
            <div className="flex gap-2">
              <Input
                id="hex-input"
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#6366f1"
                className="font-mono"
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            </div>
            {hexInput && !isValidHex(hexInput) && (
              <p className="text-xs text-red-500">
                Please enter a valid color code (e.g., #6366f1 or 6366f1)
              </p>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full"
                onClick={handleConfirmColor}
                disabled={!isValidHex(hexInput) || isUpdating}
              >
                {isUpdating ? "Updating..." : "I like this"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
