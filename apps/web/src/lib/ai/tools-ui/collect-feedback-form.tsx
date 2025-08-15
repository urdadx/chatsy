import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useEmbedToken } from "@/lib/contexts/embed-token-context";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function CollectFeedbackForm({ color }: { color?: string }) {
  const embedToken = useEmbedToken();
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

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const requestData = {
        ...data,
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
      console.error("Error sending feedback:", error);
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
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Your Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          Subject (Optional)
        </label>
        <Input
          id="subject"
          name="subject"
          placeholder="Regarding your service..."
          value={formData.subject}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
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
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Spinner className="text-white h-4 w-4 inline-block" />
            Sending...
          </>
        ) : (
          "Send Feedback"
        )}
      </Button>
    </form>
  );
}
