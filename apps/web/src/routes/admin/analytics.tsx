import { ChatAnalytics } from "@/components/analytics/analytics-graph";
import { ChatsByCountry } from "@/components/analytics/chats-by-country";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-5xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-sm text-muted-foreground">
        Track and get insights on your bot's performance
      </span>
      <Tabs defaultValue="tab-1" className="w-full mt-6">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="tab-1"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Chat history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">
          <>
            <ChatAnalytics />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-6">
              <ChatsByCountry />
              <ChatsByCountry />
            </div>
            <div className="h-[14px]" />
          </>
        </TabsContent>
        <TabsContent value="tab-2">
          <p className="text-muted-foreground p-4 text-xs">Content for Tab 2</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
