import { useCreateTextSource } from "@/lib/text-source-client";
import { useState } from "react";
import { toast } from "sonner";
import { TextSourceList } from "./text-source-list";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export const TextSource = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { mutateAsync: createTextSource, isPending } = useCreateTextSource();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTextSource({ title, content });
      toast.success("Text source added successfully!");
      setTitle("");
      setContent("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add text source.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 rounded-md p-8 border">
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="w-fit" type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add text source"}
            </Button>
          </div>
        </form>
      </div>
      <TextSourceList />
    </>
  );
};
