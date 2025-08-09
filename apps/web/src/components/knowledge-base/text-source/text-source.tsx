import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const { mutateAsync: createTextSource, isPending } = useMutation({
    mutationFn: async (textSource: { title: string; content: string }) => {
      const { data } = await api.post("/text-sources", textSource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["text-sources", organizationId],
      });
    },
  });

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
      <div className="flex flex-col gap-2 rounded-md p-6 border">
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
