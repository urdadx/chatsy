import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useEmbedToken } from "@/lib/contexts/embed-token-context";
import { getClientLocation } from "@/lib/utils/client-location";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CollectFeedbackForm({ color }: { color?: string }) {
  const embedTokenFromContext = useEmbedToken();
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      // Get user location before sending
      const location = await getClientLocation();

      const requestData = {
        ...data,
        location,
        ...(embedToken && { embedToken }),
      };

      const response = await api.post("/feedback", requestData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Feedback sent successfully!");
      setFormData({ email: "", subject: "", message: "" });
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
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div >
        <Label htmlFor="email" className="block text-sm font-medium mb-2">
          Your Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jon@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="subject" className="block text-sm font-medium mb-2">
          Subject (Optional)
        </Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Regarding your service..."
          value={formData.subject}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          className="w-full"
          placeholder="Your feedback here..."
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

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
            <Spinner className="text-white h-4 w-4 inline-block" />
            Submitting
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
