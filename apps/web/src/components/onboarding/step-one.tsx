import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const StepOne = () => {
  const { nextStep } = useStepperStore();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(false);

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/^-|-$/g, "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name if slug hasn't been manually changed
    if (name === "name" && !slugManuallyChanged) {
      const autoSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        slug: autoSlug,
      }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setSlugManuallyChanged(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.name.trim() || !formData.slug.trim()) {
        throw new Error("Please fill in all required fields");
      }

      const isAvailable = await authClient.organization.checkSlug({
        slug: formData.slug.trim(),
      });

      if (!isAvailable) {
        throw new Error(
          "This slug is already taken. Please choose a different one.",
        );
      }

      const result = await authClient.organization.create({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to create workspace");
      }

      await authClient.organization.setActive({
        organizationId: result.data.id,
      });

      toast.success("Workspace created successfully!");

      setFormData({ name: "", slug: "" });
      setSlugManuallyChanged(false);
      setError("");
      nextStep();
    } catch (error: any) {
      toast.error("Error creating workspace");
      setError(
        error.message || "Failed to create workspace. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <motion.div initial="hidden" animate="visible">
      <form className="pt-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              Create your workspace
            </h1>
            <p className="text-start text-muted-foreground">
              Set up your workspace to get started
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              autoFocus
              id="name"
              name="name"
              type="text"
              placeholder="Acme, Inc."
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="space-y-2">
              <Label>Slug</Label>
              <div className="flex rounded-md shadow-xs">
                <span className="border-input bg-gray-50 text-gray-500 inline-flex items-center rounded-s-md border px-3 text-sm">
                  app.padyna.com/
                </span>
                <Input
                  className="-ms-px rounded-s-none shadow-none"
                  placeholder="acme"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !formData.name.trim() || !formData.slug.trim()
                }
              >
                {isLoading ? "Creating..." : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
