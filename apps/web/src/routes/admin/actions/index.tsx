import { ActionCard } from "@/components/agents/actions-card";
import { CreateActionDialog } from "@/components/agents/create-action-dialog";
import { CalIntegrationCard } from "@/components/integrations/cal-card";
import { CalendlyIntegrationCard } from "@/components/integrations/calendly-card";
import { WhatsappIntegrationCard } from "@/components/integrations/whatsapp-card";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActionType } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

const agentSearchSchema = z.object({
  tab: z.enum(["agent-actions", "integrations"]).optional().default("agent-actions"),
});

export const Route = createFileRoute("/admin/actions/")({
  component: RouteComponent,
  validateSearch: agentSearchSchema,
});

function RouteComponent() {
  const [_searchTerm, _setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const navigate = useNavigate({ from: "/admin/actions" });
  const { tab } = useSearch({ from: "/admin/actions/" });

  const handleTabChange = (value: string) => {
    navigate({ search: { tab: value as "agent-actions" | "integrations" } });
  }

  const {
    data: actionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["actions"],
    queryFn: async () => {
      const response = await api.get("/agent-actions");
      return response.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      actionId,
      isActive,
      showInQuickMenu,
    }: {
      actionId: string;
      isActive?: boolean;
      showInQuickMenu?: boolean;
    }) => {
      const payload: any = { actionId };
      if (typeof isActive === "boolean") payload.isActive = isActive;
      if (typeof showInQuickMenu === "boolean") payload.showInQuickMenu = showInQuickMenu;

      const response = await api.patch("/agent-actions", payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (typeof variables.isActive === "boolean") {
        toast.success(
          `Action ${variables.isActive ? "enabled" : "disabled"} successfully`,
        );
      }
      if (typeof variables.showInQuickMenu === "boolean") {
        toast.success(
          `Quick menu ${variables.showInQuickMenu ? "enabled" : "disabled"} successfully`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update action",
      );
    },
  });

  const descriptionMutation = useMutation({
    mutationFn: async ({
      actionId,
      description,
    }: {
      actionId: string;
      description: string;
    }) => {
      const response = await api.patch("/agent-actions", {
        actionId,
        description,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Action description updated successfully");
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update action description",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await api.delete("/agent-actions", {
        data: { actionId },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Action deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete action",
      );
    },
  });

  const handleToggleAction = (actionId: string, field: 'isActive' | 'showInQuickMenu', value: boolean) => {
    if (field === 'isActive') {
      toggleMutation.mutate({ actionId, isActive: value });
    } else if (field === 'showInQuickMenu') {
      toggleMutation.mutate({ actionId, showInQuickMenu: value });
    }
  };

  const handleDescriptionChange = (actionId: string, description: string) => {
    descriptionMutation.mutate({ actionId, description });
  };

  const handleDeleteAction = (actionId: string) => {
    deleteMutation.mutate(actionId);
  };

  const actions: ActionType[] = actionData?.actions || [];

  const filteredActions = actions.filter(
    (action) =>
      action.toolName !== "knowledge_base" &&
      action.toolName !== "escalate_to_human"
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner size={24} className="text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <div className="text-center space-y-1">
          <p className="text-md text-destructive">Failed to load actions</p>
          {error && (
            <p className="text-sm text-muted-foreground max-w-sm">{(error as any)?.response?.data?.message || (error as Error).message}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-12 py-6 min-h-screen">
      <div className="w-full min-h-screen">

        <Tabs
          className="w-full max-w-6xl mx-auto "
          defaultValue="agent-actions"
          value={tab}
          onValueChange={handleTabChange}

        >
          <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
            <TabsTrigger
              value="agent-actions"
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
          <TabsContent value="agent-actions" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              {/* biome-ignore lint/a11y/useHeadingContent: <explanation> */}
              <h2 className="text-xl font-semibold flex sm:hidden"></h2>
              <h2 className="text-xl font-semibold hidden sm:flex">Agent Actions</h2>
              <CreateActionDialog />
            </div>
            {!isLoading && !isError && (
              <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onToggle={handleToggleAction}
                    onDescriptionChange={handleDescriptionChange}
                    onDelete={handleDeleteAction}
                    isLoading={toggleMutation.isPending || descriptionMutation.isPending || deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent className="mt-6 space-y-6" value="integrations">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold hidden sm:flex">Platform Integrations</h2>
              {/* biome-ignore lint/a11y/useHeadingContent: <explanation> */}
              <h2 className="text-xl font-semibold flex sm:hidden"></h2>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <CalendlyIntegrationCard />
              <CalIntegrationCard />
              <WhatsappIntegrationCard />
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
