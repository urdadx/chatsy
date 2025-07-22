import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { authClient, useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const WorkspaceLogoSettings = () => {
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId ?? "";
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const organization = useMemo(
    () =>
      authClient.organization.getFullOrganization({
        query: { organizationId: organizationId },
      }),
    [organizationId],
  );

  const [isUploading, setIsUploading] = useState(false);

  const [{ files }, { getInputProps, openFileDialog }] = useFileUpload({
    accept: "image/*",
    maxFiles: 1,
  });

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

      const resolvedOrganization = await organization;
      if (resolvedOrganization) {
        await authClient.organization.update({
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
            <h2 className="text-base font-semibold mb-2">Workspace Logo</h2>
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
          <Button onClick={handleSave} disabled={!previewUrl || isUploading}>
            {isUploading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};
