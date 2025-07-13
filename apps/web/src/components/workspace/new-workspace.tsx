import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Building } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export const CreateWorkspace = ({ open, setOpen }: any) => {
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
      setOpen(false);

      setFormData({ name: "", slug: "" });
      setSlugManuallyChanged(false);
      setError("");
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-md ">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <Building className="size-5 stroke-zinc-800 dark:stroke-zinc-100" />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Create a workspace
              </DialogTitle>
              <DialogDescription className="sm:text-center underline-offset-4">
                What is a workspace?
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="*:not-first:mt-2">
                <Label htmlFor="name">Workspace name</Label>
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
                  <Label>Workspace slug</Label>
                  <div className="flex rounded-md shadow-xs">
                    <span className="border-input bg-gray-50 text-gray-500 inline-flex items-center rounded-s-md border px-3 text-sm">
                      padyna.com/
                    </span>
                    <Input
                      className="-ms-px rounded-s-none shadow-none"
                      placeholder="acme-inc"
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                    />
                  </div>
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
