import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export type TextSource = {
  id: string;
  title: string;
  content: string;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export const EditTextSource = ({
  textSource,
  open,
  onOpenChange,
}: {
  textSource: TextSource;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [title, setTitle] = useState(textSource.title || "");
  const [content, setContent] = useState(textSource.content || "");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.patch("/text-sources", {
        id: textSource.id,
        title,
        content,
      });
    },
    onSuccess: () => {
      toast.success("Text source updated!");
      queryClient.invalidateQueries({
        queryKey: ["text-sources"],
      });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update text source.");
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
          <DialogTitle className="text-md">Edit Text Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              autoFocus
              name="title"
              placeholder="Eg: Company History"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter the content"
              className="w-full min-h-32"
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
