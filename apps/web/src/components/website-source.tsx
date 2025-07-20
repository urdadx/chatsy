import { MultipleWebsites } from "./multiple-websites";
import { SingleWebsite } from "./single-website";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { WebsiteSourceList } from "./website-source-list";

export const WebsiteSource = () => {
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
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="w-fit justify-start text-foreground h-auto gap-2 bg-gray-50 rounded-md p-2 ">
            <TabsTrigger value="single">Single URL</TabsTrigger>
            <TabsTrigger value="website">Crawl an entire website</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <SingleWebsite />
          </TabsContent>
          <TabsContent value="website">
            <MultipleWebsites />
          </TabsContent>
        </Tabs>
      </div>
      <WebsiteSourceList />
    </>
  );
};
