import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

export const MultipleWebsites = () => {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post("/crawl", { url });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Content crawled successfully!");
      } else {
        toast.error(data.error || "Failed to crawl content.");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCrawl = () => {
    if (url) {
      mutation.mutate(url);
    } else {
      toast.error("Please enter a URL.");
    }
  };

  const crawlData = mutation.data?.data;
  const crawledPages = crawlData?.data || [];
  const isSuccessful =
    mutation.isSuccess && mutation.data?.success && crawledPages.length > 0;

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
          <Button
            className="w-fit"
            onClick={handleCrawl}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner /> : <PlayIcon />}
            Crawl
          </Button>
        </div>

        {isSuccessful && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
            <div className="mb-4 p-2 bg-blue-50 rounded">
              <p className="text-sm">
                <span className="font-semibold">Status:</span>{" "}
                {crawlData.status}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Progress:</span>{" "}
                {crawlData.completed}/{crawlData.total} pages
              </p>
              <p className="text-sm">
                <span className="font-semibold">Credits Used:</span>{" "}
                {crawlData.creditsUsed}
              </p>
            </div>
            <h3 className="font-bold text-lg mb-2">Crawled Pages</h3>
            <ul className="space-y-4">
              {crawledPages.map((result: any, index: number) => {
                const { metadata } = result;
                const pageUrl = metadata.sourceURL || metadata.url;
                const pageTitle = metadata.title || pageUrl;

                return (
                  <li key={index} className="border-b pb-2">
                    <h4 className="font-semibold text-blue-600">
                      <a
                        href={pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {pageTitle}
                      </a>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Status Code: {metadata.statusCode} | Credits Used:{" "}
                      {metadata.creditsUsed}
                    </p>
                    {result.markdown && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Markdown Content
                        </summary>
                        <pre className="text-sm whitespace-pre-wrap font-sans mt-1 p-2 bg-white rounded max-h-60 overflow-y-auto">
                          {result.markdown}
                        </pre>
                      </details>
                    )}
                    {result.warning && (
                      <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm">
                        <strong>Warning:</strong> {result.warning}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
