import { useRetrainingBanner } from "@/components/retraining-banner";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { TextSourceList } from "./text-source-list";

export const TextSource = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

  const { mutateAsync: createTextSource, isPending } = useMutation({
    mutationFn: async (textSource: { title: string; content: string }) => {
      const { data } = await api.post("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["text-sources"],
      });
      setBanner(true, "Retraining required");
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await createTextSource({ title, content });
        toast.success("Text source added successfully!");
        setTitle("");
        setContent("");
      } catch (error: any) {
        toast.error(error.message || "Failed to add text source.");
      }
    },
    [createTextSource, title, content],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [],
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl p-6 border">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="font-semibold text-lg">Text Source</h2>
          <p className="text-semibold text-base text-muted-foreground">
            Add plain text sources to train your agent with specific information
          </p>
        </div>

        <form className="flex flex-col " onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div className="w-full flex flex-col gap-2">
              <Label className="text-sm" htmlFor="title">
                Title
              </Label>
              <Input
                className="w-full text-base"
                placeholder="Ex: Company Policies"
                type="text"
                name="title"
                required
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm" htmlFor="text">
                Text Content
              </Label>
              <Textarea
                className="text-sm"
                rows={6}
                required
                placeholder="Enter your text content here"
                value={content}
                onChange={handleContentChange}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-fit" type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add text source"}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
      <TextSourceList />
    </>
  );
};
