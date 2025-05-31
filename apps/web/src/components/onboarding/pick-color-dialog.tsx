import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Palette, Plus } from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Label } from "../ui/label";

export const ColorPickerDialog = () => {
  const [color, setColor] = useState("#6366f1");
  const [hexInput, setHexInput] = useState(color);

  const isValidHex = (hex: string) => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const normalizeHex = (hex: string) => {
    let normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (normalized.length === 4) {
      // Convert 3-digit hex to 6-digit
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

  return (
    <Dialog>
      <DialogTrigger>
        <button
          type="button"
          className="w-8 h-8 cursor-pointer rounded-full flex items-center border-2 border-dashed border-gray-500 justify-center transition-all duration-200 hover:bg-gray-100 hover:scale-105"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex text-md items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Pick a color
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Picker */}
          <div className="flex justify-center">
            <div className="relative">
              <HexColorPicker
                color={color}
                onChange={handleColorChange}
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          </div>
          {/* Hex Input */}
          <div className="space-y-2">
            <Label
              htmlFor="hex-input"
              className="text-sm font-medium text-gray-700"
            >
              Color code
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
                className="w-10 h-10 rounded-md border-2 border-gray-200 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            </div>
            {hexInput && !isValidHex(hexInput) && (
              <p className="text-xs text-red-500">
                Please enter a valid color color (e.g., #6366f1 or 6366f1)
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
