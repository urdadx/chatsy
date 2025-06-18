import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";  
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export const EditSocialLink = ({
  url,
  id,
  open,
  platform,
  onOpenChange,
}: {
  id: string;
  platform: string;
  url: string;

  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [linkPlatform, setLinkPlatform] = useState(platform || "");
  const [linkURL, setLinkURL] = useState(url || "");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.patch("/my-links", {
        id: id,
        platform: linkPlatform,
        url: linkURL,
      });
    },
    onSuccess: () => {
      toast.success("Link updated!");
      queryClient.invalidateQueries({ queryKey: ["links"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update link.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">Edit Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium">
              Platform
            </Label>
            <Input
              id="platform"
              name="platform"
              placeholder="e.g. Twitter, Instagram"
              value={linkPlatform}
              onChange={(e) => setLinkPlatform(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              URL
            </Label>
            <Input
              id="url"
              name="url"
              placeholder="https://twitter.com/yourprofile"
              value={linkURL}
              onChange={(e) => setLinkURL(e.target.value)}
            />
          </div>
          <div className="flex justify-end w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-purple-600 text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
