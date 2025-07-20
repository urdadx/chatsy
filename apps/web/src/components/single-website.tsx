import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";

export const SingleWebsite = () => {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post("/scrape", { url });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Content extracted successfully!");
      } else {
        toast.error(data.error || "Failed to extract content.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleScrape = () => {
    if (url) {
      mutation.mutate(url);
    } else {
      toast.error("Please enter a URL.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 mt-6">
        <p className="text-sm text-muted-foreground">
          Enter a single URL to extract content from that page.
        </p>
        <div className="w-full flex justify-between items-center gap-2">
          <div className="flex rounded-md shadow-xs flex-1">
            <span className="border-input bg-gray-50 text-gray-500 inline-flex items-center rounded-s-md border px-3 text-sm">
              https://
            </span>
            <Input
              className="w-full -ms-px rounded-s-none shadow-none"
              placeholder="mywebsite.com"
              type="text"
              name="slug"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          <Button
            className="w-fit"
            onClick={handleScrape}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner /> : <PlayIcon />}
            Run
          </Button>
        </div>
      </div>
    </>
  );
};
