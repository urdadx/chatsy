import { SolarUploadBoldDuotone } from "@/assets/icons/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useEmbedToken } from "@/lib/contexts/embed-token-context";
import { getClientLocation } from "@/lib/utils/client-location";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function IssueReportForm({ color }: { color?: string }) {
  const embedTokenFromContext = useEmbedToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    email: "",
    screenshot: null as File | null,
  });

  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, screenshot: file }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
    }
  };

  const removeScreenshot = () => {
    setFormData(prev => ({ ...prev, screenshot: null }));
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Memoize the embed token calculation
  const embedToken = useMemo(() => {
    if (embedTokenFromContext) {
      return embedTokenFromContext;
    }

    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const bubbleMatch = path.match(/\/(bubble|talk)\/(.+)/);
      return bubbleMatch ? bubbleMatch[2] : undefined;
    }

    return undefined;
  }, [embedTokenFromContext]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const location = await getClientLocation();

      let screenshotUrl = null;

      if (data.screenshot) {
        const formData = new FormData();
        formData.append('file', data.screenshot);

        try {
          const uploadResponse = await api.post("/api/upload-images", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          screenshotUrl = uploadResponse.data.url;
        } catch (error) {
          console.warn('Screenshot upload failed, continuing without it:', error);
        }
      }

      const requestData = {
        title: data.title,
        description: data.description,
        email: data.email || null,
        screenshot: screenshotUrl,
        location,
        ...(embedToken && { embedToken }),
      };

      const response = await api.post("/report-issue", requestData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Submitted successfully!");
      setFormData({ title: "", description: "", email: "", screenshot: null });
      removeScreenshot();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="block text-sm font-medium mb-2">
          Issue Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Page not loading"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          className="w-full min-h-[90px]"
          placeholder="Describe the feature you'd like to see..."
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="screenshot" className="block text-sm font-medium mb-2">
          Screenshot (Optional)
        </Label>
        <div className="space-y-3">
          {!screenshotPreview ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <SolarUploadBoldDuotone className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload a screenshot or mockup
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to 5MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <img
                  src={screenshotPreview}
                  alt="Preview"
                  className="w-8 h-8 object-cover rounded border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formData.screenshot?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.screenshot ? `${(formData.screenshot.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeScreenshot}
                className="ml-3 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* <div>
        <Label htmlFor="email" className="block text-sm font-medium mb-2">
          Your Email (Optional)
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jon@example.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div> */}

      <Button
        style={{
          backgroundColor: color,
          color: "#FFFFFF",
        }}
        type="submit"
        className="w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Spinner className="text-white h-4 w-4 inline-block mr-2" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
