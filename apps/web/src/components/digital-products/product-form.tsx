import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const createProduct = async (productData: {
  name: string;
  url: string;
  price: string;
  image: string;
  type: string;
}) => {
  const response = await api.post("/my-products", productData);
  return response.data;
};

export const MerchForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    price: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onError: (error) => {
      console.error("Image upload error:", error);
      toast.error("Image upload failed");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product added!");
      setFormData({ url: "", title: "", price: "" });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
    onError: (error) => {
      console.error("Product creation error:", error);
      toast.error("Failed to create product");
    },
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please upload an image");
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.url.trim() ||
      !formData.price.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const uploadResult = await uploadImageMutation.mutateAsync(file);

      await createProductMutation.mutateAsync({
        name: formData.title,
        url: formData.url,
        price: formData.price,
        image: uploadResult.url,
        type: "merch",
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isLoading =
    uploadImageMutation.isPending || createProductMutation.isPending;

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="url" className="text-sm font-medium">
                Product URL
              </Label>
              <Input
                id="url"
                type="url"
                autoFocus
                placeholder="eg: https://example.com/my-product"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="title" className="text-sm font-medium">
                Product name
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter product name"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <ImageIcon className="h-4 w-4" />
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
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (in USD)
              </Label>
              <Input
                id="price"
                type="text"
                placeholder="eg: 100"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-6 w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-purple-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    {uploadImageMutation.isPending
                      ? "Uploading..."
                      : "Creating Product..."}
                  </div>
                ) : (
                  "Add Product"
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};
