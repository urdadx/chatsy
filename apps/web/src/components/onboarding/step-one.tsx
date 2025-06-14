import { addNameBio } from "@/lib/server-functions/onboarding-queries";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface FormData {
  username: string;
  bio: string;
}

export const StepOne = () => {
  const { nextStep, isFirstStep } = useStepperStore();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    bio: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await addNameBio({
        data: { username: data.username, bio: data.bio },
      });
    },
    onSuccess: () => {
      nextStep();
    },
    onError: () => {
      toast.error("An error occured. Please try again.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (updateProfileMutation.error) {
      updateProfileMutation.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <motion.div initial="hidden" animate="visible">
      <form onSubmit={handleSubmit} className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              First things first.
            </h1>
            <p className="text-start text-muted-foreground">
              Give your bot a personality
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Name</Label>
            <Input
              autoFocus
              id="username"
              name="username"
              type="text"
              placeholder="ex: rico"
              value={formData.username}
              onChange={handleInputChange}
              disabled={updateProfileMutation.isPending}
              className={
                updateProfileMutation.error?.message.includes("Username")
                  ? "border-red-500"
                  : ""
              }
              required
            />
            {updateProfileMutation.error?.message.includes("Username") && (
              <p className="text-red-500 text-sm mt-1">
                {updateProfileMutation.error.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleInputChange}
              disabled={updateProfileMutation.isPending}
              className={
                updateProfileMutation.error?.message.includes("Bio")
                  ? "border-red-500"
                  : ""
              }
            />
            {updateProfileMutation.error?.message.includes("Bio") && (
              <p className="text-red-500 text-sm mt-1">
                {updateProfileMutation.error.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={isFirstStep() || updateProfileMutation.isPending}
            >
              Previous
            </Button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleContinue}
                disabled={
                  updateProfileMutation.isPending || !formData.username.trim()
                }
                className="min-w-[120px]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
