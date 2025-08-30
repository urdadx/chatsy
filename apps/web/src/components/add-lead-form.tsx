import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getClientLocation } from "@/lib/utils/client-location";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddLeadForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get user location before sending
      const location = await getClientLocation();

      // Map form fields to API expected format
      const apiData = {
        name: data.name,
        contact: data.email || data.phone, // Use email as primary contact, fallback to phone
        message: data.message,
        location,
      };

      const response = await api.post("/leads", apiData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lead added successfully!");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      console.error("Error adding lead:", error);
      toast.error(error.response?.data?.message || "Failed to add lead.");
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="ml-auto">
            <PlusIcon size={16} aria-hidden="true" />
            Add Lead
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
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
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              name="company"
              placeholder="Company name"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="message">Notes (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Additional notes about this lead..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-purple-600 text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "ubmit"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
