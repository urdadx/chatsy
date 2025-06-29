import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBranding, useUpdateBranding } from "@/hooks/use-bot-branding";
import { motion } from "framer-motion";
import { ArrowRight, Palette } from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export const PickColor = () => {
  const { data: branding, isLoading: isBrandingLoading } = useBranding();
  const updateBrandingMutation = useUpdateBranding();

  const [selectedColor, setSelectedColor] = useState(
    branding?.primaryColor || "#9333ea",
  );
  const [tempColor, setTempColor] = useState(selectedColor);
  const [hexInput, setHexInput] = useState(selectedColor);
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
    setTempColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      const normalized = normalizeHex(value);
      setTempColor(normalized);
    }
  };

  const handleConfirmColor = async () => {
    if (!isValidHex(hexInput) || !branding) return;

    try {
      const normalizedColor = normalizeHex(hexInput);

      // Update branding in the database
      const updatedBranding = {
        ...branding,
        primaryColor: normalizedColor,
      };

      await updateBrandingMutation.mutateAsync(updatedBranding);

      // Update local state
      setSelectedColor(normalizedColor);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating color:", error);
      // You might want to show a toast notification here
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset temp values to current selected color when opening
      setTempColor(selectedColor);
      setHexInput(selectedColor);
    }
  };

  // Show loading state while branding is loading
  if (isBrandingLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{selectedColor}</span>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: selectedColor,
            }}
            className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-md hover:shadow-lg transition-shadow"
          />
        </div>
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
                color={tempColor}
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
                disabled={updateBrandingMutation.isPending}
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                style={{ backgroundColor: tempColor }}
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
                disabled={
                  !isValidHex(hexInput) ||
                  updateBrandingMutation.isPending ||
                  !branding
                }
              >
                {updateBrandingMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    Submit
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
