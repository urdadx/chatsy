import { useRetrainingBanner } from "@/components/retraining-banner";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import Spinner from "../../ui/spinner";

export const ScrapeWebsite = () => {
  const [url, setUrl] = useState("");
  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post("/scrape", { url });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["website-sources"] });
        setBanner(true, "Retraining required");
        toast.success("Content extracted successfully!");
        setUrl("");
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
          Enter a single URL to extract content from it.
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-fit"
              onClick={handleScrape}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Spinner className="text-white" />
              ) : (
                <PlayIcon />
              )}
              Run
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};
