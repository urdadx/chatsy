import {
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useChatbot, useUpdateChatbot } from "@/hooks/use-chatbot";
import { useFileUpload } from "@/hooks/use-file-upload";
import Spinner from "./ui/spinner";

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

export function AvatarUpload() {
  // Chatbot hooks
  const { data: chatbot, isLoading: isChatbotLoading } = useChatbot();
  const updateChatbotMutation = useUpdateChatbot();

  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  });

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const previousFileIdRef = useRef<string | undefined | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);

  // Set initial image from chatbot data
  useEffect(() => {
    if (chatbot?.image && !finalImageUrl) {
      setFinalImageUrl(chatbot.image);
    }
  }, [chatbot?.image, finalImageUrl]);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels || !chatbot) {
      console.error("Missing data for apply:", {
        previewUrl,
        fileId,
        croppedAreaPixels,
        chatbot,
      });
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      setIsUploading(true);

      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      const formData = new FormData();
      formData.append("file", croppedBlob, "avatar.jpg");

      const uploadResponse = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { url: uploadedImageUrl } = await uploadResponse.json();

      // Add cache busting parameter
      const imageUrlWithCacheBust = `${uploadedImageUrl}?t=${Date.now()}`;

      // Immediately update local state for instant UI feedback
      if (finalImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(finalImageUrl);
      }
      setFinalImageUrl(imageUrlWithCacheBust);

      const updatedChatbot = {
        ...chatbot,
        image: uploadedImageUrl, // Save original URL without cache bust
      };

      await updateChatbotMutation.mutateAsync(updatedChatbot);

      removeFile(fileId);
      setIsDialogOpen(false);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Error during apply:", error);
      // Revert local state on error
      setFinalImageUrl(chatbot?.image || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFinalImage = async () => {
    if (!chatbot) return;

    try {
      // Immediately update local state for instant UI feedback
      const previousImageUrl = finalImageUrl;
      setFinalImageUrl(null);

      // Update chatbot to remove image
      const updatedChatbot = {
        ...chatbot,
        image: null,
      };

      await updateChatbotMutation.mutateAsync(updatedChatbot);

      // Clean up local state
      if (previousImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previousImageUrl);
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // Revert local state on error
      setFinalImageUrl(chatbot?.image || null);
    }
  };

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  // Show loading state while chatbot is loading
  if (isChatbotLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative inline-flex">
          <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative inline-flex w-fit border border-dashed rounded-full border-primary">
        <button
          type="button"
          className="border-primary h-14 w-14 hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex items-center justify-center overflow-hidden rounded-full  transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={finalImageUrl ? "Change image" : "Upload image"}
          disabled={isUploading || updateChatbotMutation.isPending}
        >
          {finalImageUrl ? (
            <img
              className="h-14 w-14 object-cover rounded-full"
              src={finalImageUrl}
              alt="Chatbot"
              width={56}
              height={56}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-4 opacity-60" />
            </div>
          )}
          {(isUploading || updateChatbotMutation.isPending) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            </div>
          )}
        </button>

        {finalImageUrl && !isUploading && !updateChatbotMutation.isPending && (
          <Button
            onClick={handleRemoveFinalImage}
            size="icon"
            className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none bg-red-500 hover:bg-red-600"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5 text-white" />
          </Button>
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-center">Crop image</p>
              <Button
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl || isUploading || !chatbot}
                autoFocus
              >
                {isUploading ? <>
                  <Spinner className="mr-1" size={16} />
                  Applying
                </> : "Apply"}
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
                disabled={isUploading}
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
