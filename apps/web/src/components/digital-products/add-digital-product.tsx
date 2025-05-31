import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CirclePlus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Label } from "../ui/label";

export const AddDigitalProduct = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add digital product
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Add new product</DialogTitle>
        </DialogHeader>
        <form>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="title" className="text-sm font-medium">
                Product name
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter product name (e.g: My Digital Course)"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col">
              <Label className="text-sm font-medium mb-2">Product Image</Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <Label htmlFor="url" className="text-sm font-medium">
                Product URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="eg: https://example.com/my-product"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-purple-600 text-white">
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
