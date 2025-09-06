import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const WorkspaceLogoSettings = () => {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const [isUploading, setIsUploading] = useState(false);

  const [{ files }, { getInputProps, openFileDialog }] = useFileUpload({
    accept: "image/*",
    maxFiles: 1,
  });

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  const queryClient = useQueryClient();

  const previewUrl = useMemo(() => files[0]?.preview, [files]);
  const currentLogo = useMemo(
    () => activeOrganization?.logo,
    [activeOrganization?.logo],
  );

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

      if (activeOrganization?.id) {
        await authClient.organization.update({
          organizationId: activeOrganization?.id,
          data: {
            logo: uploadedImageUrl,
          },
        });
        await queryClient.invalidateQueries({
          queryKey: ["activeOrganization"],
        });
        toast.success("Saved");
      }
    } catch (error) {
      console.error("Failed to update logo:", error);
      toast.error("Failed to update logo");
    } finally {
      setIsUploading(false);
    }
  };

  const displayImageSrc = previewUrl || currentLogo;
  const showPlaceholder = !displayImageSrc;

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-xs border overflow-hidden">
        <div className="flex justify-between items-center p-6">
          <div className="space-y-2">
            <h2 className="text-base font-semibold mb-2">Organization Logo</h2>
            <p className="text-gray-600 text-sm">
              Update your organization's photo.
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
                    alt={previewUrl ? "Preview" : "Current logo"}
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
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={!previewUrl || isUploading || !isAdmin}
                >
                  {isUploading ? "Saving..." : "Save changes"}
                </Button>
              </motion.div>
            </TooltipTrigger>
            {!isAdmin && (
              <TooltipContent className="bg-white shadow-sm p-3" sideOffset={8}>
                <p className="text-black text-sm">
                  Only admins can change organization logo. Please contact your
                  admin
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
