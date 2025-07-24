import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function CollectFeedbackForm() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = useMutation({
      mutationFn: async (data: typeof formData) => {
        const response = await api.post("/feedback", data);
        return response.data;
      },
      onSuccess: () => {
        alert("Feedback sent successfully!");
        setFormData({ email: "", subject: "", message: "" });
      },
      onError: (error: any) => {
        console.error("Error sending feedback:", error);
        alert(error.response?.data?.message || "An unexpected error occurred.");
      },
    });

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
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
          placeholder="Your feedback here..."
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit">Send Feedback</Button>
    </form>
  );
}
