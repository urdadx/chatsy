import { BotActions } from "@/components/playground/actions";
import { BotQuestions } from "@/components/playground/questions";
import { BotIntegrations } from "@/components/playground/sources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-2xl w-full max-h-screen mx-auto py-4">
      {/* <h1 className="text-lg font-semibold my-2">Playground</h1> */}
      <span className="text-sm text-muted-foreground">
        Train your bot based on common questions, actions and external data
        sources.
      </span>

      <Tabs defaultValue="tab-1" className=" mt-6 ">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="tab-1"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Q&A
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Integrations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">
          <BotQuestions />
        </TabsContent>
        <TabsContent value="tab-2">
          <BotActions />
        </TabsContent>
        <TabsContent value="tab-3">
          <BotIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
