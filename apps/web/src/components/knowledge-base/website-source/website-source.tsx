import { useNavigate, useSearch } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { CrawlWebsites } from "./crawl-websites";
import { ScrapeWebsite } from "./scrape-website";
import { WebsiteSourceList } from "./website-source-list";

export const WebsiteSource = () => {
  const navigate = useNavigate({ from: "/admin/knowledge-base" });
  const search = useSearch({ from: "/admin/knowledge-base" });

  // Get the websiteTab from search params, default to "single"
  const websiteTab = (search as any).websiteTab || "single";

  const handleTabChange = (value: string) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        websiteTab: value as "single" | "website",
      }),
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 rounded-md p-8 border">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Website</h2>
            <p className="text-semibold text-base text-muted-foreground">
              Extract content from web pages to keep your AI knowledge up to
              date.
            </p>
          </div>
        </div>
        <Tabs
          value={websiteTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-fit justify-start text-foreground h-auto gap-2 bg-gray-50 rounded-md p-2 ">
            <TabsTrigger value="single">Single URL</TabsTrigger>
            <TabsTrigger value="website">Crawl an entire website</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <ScrapeWebsite />
          </TabsContent>
          <TabsContent value="website">
            <CrawlWebsites />
          </TabsContent>
        </Tabs>
      </div>
      <WebsiteSourceList />
    </>
  );
};
