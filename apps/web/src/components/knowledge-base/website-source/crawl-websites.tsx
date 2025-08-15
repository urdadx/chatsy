import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "../../ui/spinner";

export const CrawlWebsites = () => {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post("/crawl", { url });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        const toastId = toast.loading("Crawling in progress...", {
          description: `Extracting content from ${new URL(data.url).hostname}`,
          duration: Number.POSITIVE_INFINITY,
        });

        const crawlInfo = {
          toastId,
          jobId: data.jobId,
          url: data.url,
          startTime: Date.now(),
        };

        const activeCrawls = JSON.parse(
          localStorage.getItem("activeCrawls") || "{}",
        );
        activeCrawls[data.jobId] = crawlInfo;
        localStorage.setItem("activeCrawls", JSON.stringify(activeCrawls));

        setUrl("");
      } else {
        toast.error(data.error || "Failed to start crawl.");
      }
    },
    onError: () => {
      toast.error("Failed to start crawl. Please try again.");
    },
  });

  const handleCrawl = () => {
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
          Enter a website URL to crawl and extract content from all pages.
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
              onClick={handleCrawl}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Spinner className="text-white" />
              ) : (
                <PlayIcon />
              )}
              Crawl
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};
