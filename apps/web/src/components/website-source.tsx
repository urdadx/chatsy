import { Bug } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const WebsiteSource = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg">Website</h2>
          <p className="text-semibold text-base text-muted-foreground">
            Extract content from web pages to keep your AI knowledge up to date.
          </p>
        </div>
      </div>
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="w-fit justify-start text-foreground h-auto gap-2 bg-gray-50 rounded-md p-2 ">
          <TabsTrigger value="single">Single URL</TabsTrigger>
          <TabsTrigger value="website">Crawl an entire website</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
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
                />
              </div>
              <Button className="w-fit">
                <Bug />
                Start crawling
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="website">
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
                />
              </div>
              <Button className="w-fit">Fetch links</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
