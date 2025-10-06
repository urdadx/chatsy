import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useEmbedToken } from "@/lib/contexts/embed-token-context";
import { getClientLocation } from "@/lib/utils/client-location";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CollectLeadsForm({ color }: { color?: string }) {
  const embedTokenFromContext = useEmbedToken();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
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

      const response = await api.post("/leads", requestData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Submitted!");
      setFormData({
        name: "",
        contact: "",
        message: "",
      });
    },
    onError: () => {
      toast.error(
        "An unexpected error occurred."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium ">
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

      <div className="space-y-2">
        <Label htmlFor="contact">Contact details</Label>
        <Input
          id="contact"
          name="contact"
          type="contact"
          placeholder="Email or phone number"
          value={formData.contact}
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
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
