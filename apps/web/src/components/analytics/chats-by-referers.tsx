import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOOGLE_FAVICON_URL } from "@/constants/domains";
import { getVisitorAnalytics } from "@/hooks/use-visitor-analytics";
import { getApexDomain } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import { Maximize2, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import BarList from "./bar-list";
import { ViewAllStats } from "./view-all-stats";

export function ChatsByReferrers() {
  const { timeRange } = useSearch({ from: "/admin/analytics" });
  const { data: analytics, isLoading: metricsPending } = getVisitorAnalytics(
    (timeRange as "24h" | "7d" | "30d" | "90d") || "24h",
  );
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
    <div className="h-[350px] w-full rounded-xl border bg-white">
      <Tabs defaultValue="tab-1">
        <div className="flex items-center justify-between px-4 py-3">
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
          <div className="flex items-center gap-1">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" /> Referrers
            </div>
          </div>
        </div>
        <TabsContent value="tab-1">
          <div className="px-4 relative">
            {metricsPending ? (
              <div className="w-full h-[210px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : allReferrers.length === 0 ? (
              <div className="w-full h-[210px] flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="relative">
                <BarList
                  tab="Websites"
                  unit="visits"
                  data={topReferrers}
                  barBackground="bg-purple-200"
                  hoverBackground="hover:bg-purple-50"
                  maxValue={maxReferrerCount}
                />
                {hasMoreReferrers && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => setReferrersDialogOpen(true)}
                      className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      View All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <ViewAllStats
            name={"referrers"}
            dialogOpen={referrersDialogOpen}
            setDialogOpen={setReferrersDialogOpen}
            allLinks={allReferrers}
            maxTotalCount={maxReferrerCount}
          />
        </TabsContent>
        <TabsContent value="tab-2">
          <div className="px-4 relative">
            {metricsPending ? (
              <div className="w-full h-[210px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : allReferrerURLs.length === 0 ? (
              <div className="w-full h-[210px] flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="relative">
                <BarList
                  tab="Websites"
                  unit="visits"
                  data={topReferrerURLs}
                  barBackground="bg-purple-200"
                  hoverBackground="hover:bg-purple-50"
                  maxValue={maxReferrerCount}
                />
                {hasMoreReferrerURLs && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => setReferrerURLsDialogOpen(true)}
                      className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      View All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <ViewAllStats
            name={"referrer URLs"}
            dialogOpen={referrerURLsDialogOpen}
            setDialogOpen={setReferrerURLsDialogOpen}
            allLinks={allReferrerURLs}
            maxTotalCount={maxReferrerCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
