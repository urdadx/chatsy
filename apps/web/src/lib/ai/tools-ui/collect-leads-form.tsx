import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useEmbedToken } from "@/lib/contexts/embed-token-context";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function CollectLeadsForm() {
  const embedToken = useEmbedToken();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
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

      const response = await api.post("/leads", requestData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lead information collected successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    },
    onError: (error: any) => {
      console.error("Error collecting lead:", error);
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
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          placeholder="Your company name"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message (Optional)
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your interest..."
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Spinner className="text-white h-4 w-4 inline-block" />
            Submitting...
          </>
        ) : (
          "Submit Information"
        )}
      </Button>
    </form>
  );
}
