import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { authClient, useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const UserProfileImageSettings = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [isUploading, setIsUploading] = useState(false);

  const [{ files }, { getInputProps, openFileDialog }] = useFileUpload({
    accept: "image/*",
    maxFiles: 1,
  });

  const queryClient = useQueryClient();

  const previewUrl = useMemo(() => files[0]?.preview, [files]);
  const currentImage = useMemo(() => user?.image, [user?.image]);

  const handleSave = async () => {
    const file = files[0]?.file;
    if (!file || !(file instanceof File)) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { url: uploadedImageUrl } = await uploadResponse.json();

      // Update user profile with the new image
      await authClient.updateUser({
        image: uploadedImageUrl,
      });

      // Invalidate session queries to reflect the change
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to update profile image:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsUploading(false);
    }
  };

  const displayImageSrc = previewUrl || currentImage;
  const showPlaceholder = !displayImageSrc;

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-3xl shadow-xs border overflow-hidden">
        <div className="flex justify-between items-center p-6">
          <div className="space-y-2">
            <h2 className="text-base font-semibold mb-2">Profile Picture</h2>
            <p className="text-gray-600 text-sm">
              Update your profile picture.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full border-2 border-primary border-dashed bg-transparent flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={openFileDialog}
              >
                {showPlaceholder ? (
                  <User className="w-6 h-6 text-gray-400" />
                ) : (
                  <img
                    src={displayImageSrc}
                    alt={previewUrl ? "Preview" : "Current profile picture"}
                    className="w-full h-full rounded-full object-cover"
                    style={{
                      imageRendering: "auto",
                      backfaceVisibility: "hidden",
                    }}
                    onLoad={(e) => {
                      // Ensure smooth rendering
                      e.currentTarget.style.opacity = "1";
                    }}
                    onError={(e) => {
                      console.error(
                        "Image failed to load:",
                        e.currentTarget.src,
                      );
                    }}
                  />
                )}
              </div>
              <input {...getInputProps()} className="hidden" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSave}
              disabled={!previewUrl || isUploading}
            >
              {isUploading ? "Saving..." : "Save changes"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
