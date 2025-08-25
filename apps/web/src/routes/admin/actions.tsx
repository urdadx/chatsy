import { Actions } from "@/components/agents/general-actions";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const agentSearchSchema = z.object({
  tab: z.enum(["general", "integrations"]).optional().default("general"),
});

export const Route = createFileRoute("/admin/actions")({
  component: RouteComponent,
  validateSearch: agentSearchSchema,
});

function RouteComponent() {
  // const navigate = useNavigate({ from: "/admin/actions" });
  // const { tab } = useSearch({ from: "/admin/actions" });

  // const handleTabChange = (value: string) => {
  //   navigate({
  //     search: { tab: value as "general" | "integrations" },
  //   });
  // };

  return (
    <div className=" max-w-4xl w-full max-h-screen mx-auto px-4 sm:px-0 py-6">
      <div className="hidden sm:block">
        <h1 className="text-xl font-semibold mb-2 ">Agent Actions</h1>
        <span className="text-md text-muted-foreground">
          Enhance your bot's capabilities with powerful AI actions and
          integrations
        </span>
      </div>
      <Actions />

      {/* <Tabs value={tab} onValueChange={handleTabChange} className="w-full mt-3">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="general"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Actions
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Integrations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Actions />
        </TabsContent>
        <TabsContent value="integrations">
          <Integrations />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
