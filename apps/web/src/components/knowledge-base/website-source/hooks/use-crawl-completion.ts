import type { WebsiteSource } from "@/db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CrawlInfo {
  toastId: string;
  startTime: number;
}

interface ActiveCrawls {
  [jobId: string]: CrawlInfo;
}

export const useCrawlCompletion = (sources: WebsiteSource[]) => {
  const [completedCrawls, setCompletedCrawls] = useState<Set<string>>(
    new Set(),
  );
  const previousSourcesRef = useRef<WebsiteSource[]>([]);
  const completionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const queryClient = useQueryClient();

  const getActiveCrawls = (): ActiveCrawls => {
    return JSON.parse(localStorage.getItem("activeCrawls") || "{}");
  };

  const updateActiveCrawls = (crawls: ActiveCrawls) => {
    localStorage.setItem("activeCrawls", JSON.stringify(crawls));
  };

  const groupSourcesByCrawlJob = (
    sources: WebsiteSource[],
  ): Map<string, WebsiteSource[]> => {
    const crawlJobs = new Map<string, WebsiteSource[]>();
    sources.forEach((source) => {
      if (source.crawlJobId) {
        if (!crawlJobs.has(source.crawlJobId)) {
          crawlJobs.set(source.crawlJobId, []);
        }
        crawlJobs.get(source.crawlJobId)!.push(source);
      }
    });
    return crawlJobs;
  };

  const handleCrawlCompletion = (jobId: string, crawlInfo: CrawlInfo) => {
    // Dismiss the loading toast and show success
    toast.dismiss(crawlInfo.toastId);
    toast.success("Crawling done, please train your agent");

    // Mark this crawl as completed and remove from active crawls
    setCompletedCrawls((prev) => new Set([...prev, jobId]));

    const activeCrawls = getActiveCrawls();
    delete activeCrawls[jobId];
    updateActiveCrawls(activeCrawls);

    queryClient.invalidateQueries({
      queryKey: ["website-sources"],
    });

    localStorage.removeItem("lastTrainedAt");
    completionTimeoutsRef.current.delete(jobId);
  };

  const setupCompletionTimeout = (jobId: string) => {
    // Clear existing timeout for this job
    const existingTimeout = completionTimeoutsRef.current.get(jobId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a new timeout - if no new pages arrive within 5 seconds, consider crawl complete
    const timeout = setTimeout(() => {
      const activeCrawlsNow = getActiveCrawls();
      if (activeCrawlsNow[jobId] && !completedCrawls.has(jobId)) {
        handleCrawlCompletion(jobId, activeCrawlsNow[jobId]);
      }
    }, 5000);

    completionTimeoutsRef.current.set(jobId, timeout);
  };

  const checkForNewSources = () => {
    const activeCrawls = getActiveCrawls();

    // If there are no active crawls, nothing to check
    if (Object.keys(activeCrawls).length === 0) {
      previousSourcesRef.current = sources;
      return;
    }

    if (sources.length > previousSourcesRef.current.length) {
      const currentCrawlJobs = groupSourcesByCrawlJob(sources);

      // For each active crawl, set up or reset a completion timeout
      Object.keys(activeCrawls).forEach((jobId) => {
        if (!completedCrawls.has(jobId)) {
          const currentPages = currentCrawlJobs.get(jobId) || [];
          if (currentPages.length > 0) {
            setupCompletionTimeout(jobId);
          }
        }
      });
    }
    previousSourcesRef.current = sources;
  };

  const cleanupExpiredCrawls = () => {
    const activeCrawls = getActiveCrawls();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let hasChanges = false;

    Object.entries(activeCrawls).forEach(([jobId, crawlInfo]) => {
      if (now - crawlInfo.startTime > oneHour) {
        toast.dismiss(crawlInfo.toastId);
        delete activeCrawls[jobId];
        hasChanges = true;

        // Clear any pending timeout
        const timeout = completionTimeoutsRef.current.get(jobId);
        if (timeout) {
          clearTimeout(timeout);
          completionTimeoutsRef.current.delete(jobId);
        }
      }
    });

    if (hasChanges) {
      updateActiveCrawls(activeCrawls);
    }
  };

  const cleanupCompletedCrawls = () => {
    setCompletedCrawls((prev) => {
      if (prev.size > 50) {
        return new Set();
      }
      return prev;
    });
  };

  // Effect for checking new sources
  useEffect(() => {
    checkForNewSources();
  }, [sources, completedCrawls, queryClient]);

  // Effect for periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      cleanupCompletedCrawls();
      cleanupExpiredCrawls();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(cleanup);
      // Clear all timeouts on component unmount
      completionTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    completedCrawls,
  };
};
