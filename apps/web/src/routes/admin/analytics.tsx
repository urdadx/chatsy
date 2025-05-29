import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-4xl w-full max-h-screen mx-auto py-4">
      {/* <h1 className="text-lg font-semibold my-2">Analytics</h1> */}
      <span className="text-sm text-muted-foreground">
        View detailed of your bot analytics and chat history
      </span>
      <Tabs defaultValue="tab-1" className="w-full mt-6">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="tab-1"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Chat analytics
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            All conversations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">
          <p className="text-muted-foreground p-4 text-xs">Content for Tab 1</p>
        </TabsContent>
        <TabsContent value="tab-2">
          <p className="text-muted-foreground p-4 text-xs">Content for Tab 2</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
