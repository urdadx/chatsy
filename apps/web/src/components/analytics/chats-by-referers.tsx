import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { useRealTimeVisitorHistory } from "@/hooks/log-visitor-analytics";
import { getApexDomain } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import { Maximize2, MousePointerClick } from "lucide-react";
import { useState } from "react";
import Spinner from "../ui/spinner";
import BarList from "./bar-list";
import { ViewAllStats } from "./view-all-stats";

interface ChatsByReferrersProps {
  visitorData?: any[];
}

export function ChatsByReferrers({
  visitorData: propVisitorData,
}: ChatsByReferrersProps) {
  const { timeRange } = useSearch({ from: "/admin/analytics" });

  // Use prop data if provided, otherwise fetch it
  const result = useRealTimeVisitorHistory(
    (timeRange as "24h" | "7d" | "30d" | "90d") || "24h",
  );

  const { data: fetchedAnalytics, isLoading: metricsPending } = result;
  const analytics = propVisitorData || fetchedAnalytics;

  const [referrersDialogOpen, setReferrersDialogOpen] = useState(false);
  const [referrerURLsDialogOpen, setReferrerURLsDialogOpen] = useState(false);

  // Aggregate referers
  const refererMap: Record<string, number> = {};
  const refererUrlMap: Record<string, number> = {};
  if (Array.isArray(analytics)) {
    analytics.forEach((row) => {
      if (row.referer) {
        refererMap[getApexDomain(row.referer)] =
          (refererMap[getApexDomain(row.referer)] || 0) + 1;
        refererUrlMap[row.referer] = (refererUrlMap[row.referer] || 0) + 1;
      }
    });
  }
  const allReferrers = Object.entries(refererMap).map(
    ([referer, totalCount]) => {
      const iconSrc = `${GOOGLE_FAVICON_URL}${referer}`;
      return {
        icon: (
          <img
            src={iconSrc}
            alt={`Favicon for ${referer}`}
            key={referer}
            className="rounded-full w-4"
          />
        ),
        title: referer,
        href: "",
        value: totalCount,
        linkId: "",
      };
    },
  );
  const allReferrerURLs = Object.entries(refererUrlMap).map(
    ([referer, totalCount]) => {
      const apexDomain = getApexDomain(referer);
      const iconSrc = `${GOOGLE_FAVICON_URL}${apexDomain}`;
      return {
        icon: (
          <img
            src={iconSrc}
            alt={`Favicon for ${apexDomain}`}
            key={apexDomain}
            className="rounded-full w-4"
          />
        ),
        title: referer,
        href: "",
        value: totalCount,
        linkId: "",
      };
    },
  );
  const topReferrers = allReferrers.slice(0, 5);
  const topReferrerURLs = allReferrerURLs.slice(0, 5);
  const hasMoreReferrers = allReferrers.length > 5;
  const hasMoreReferrerURLs = allReferrerURLs.length > 5;
  const maxReferrerCount =
    allReferrers.length > 0
      ? Math.max(...allReferrers.map((referer) => referer.value))
      : 0;

  return (
    <div className="h-[350px] w-full rounded-xl border bg-white flex flex-col overflow-hidden">
      <Tabs defaultValue="tab-1" className="flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 ">
          <TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
            <TabsTrigger
              value="tab-1"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Referrers
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Referrer URL
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" /> Referrers
            </div>
          </div>
        </div>

        {/* Content area - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="tab-1" className="h-full m-0 p-0">
            {metricsPending ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : allReferrers.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topReferrers}
                    barBackground="bg-purple-200"
                    hoverBackground="hover:bg-purple-50"
                    maxValue={maxReferrerCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreReferrers && (
                  <div className="flex-shrink-0 px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setReferrersDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name={"referrers"}
              dialogOpen={referrersDialogOpen}
              setDialogOpen={setReferrersDialogOpen}
              allLinks={allReferrers}
              maxTotalCount={maxReferrerCount}
            />
          </TabsContent>

          <TabsContent value="tab-2" className="h-full m-0 p-0">
            {metricsPending ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : allReferrerURLs.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topReferrerURLs}
                    barBackground="bg-purple-200"
                    hoverBackground="hover:bg-purple-50"
                    maxValue={maxReferrerCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreReferrerURLs && (
                  <div className="flex-shrink-0 px-4 py-3 ">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setReferrerURLsDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name={"referrer URLs"}
              dialogOpen={referrerURLsDialogOpen}
              setDialogOpen={setReferrerURLsDialogOpen}
              allLinks={allReferrerURLs}
              maxTotalCount={maxReferrerCount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
