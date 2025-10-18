import { ActionsEmptyState } from "@/components/agents/action-empty-state";
import { ActionCard } from "@/components/agents/actions-card";
import { CreateActionDialog } from "@/components/agents/create-action-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import type { ActionType } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/actions/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

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
      action.toolName !== "escalate_to_human" &&
      (searchTerm === "" ||
        action.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description?.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            {/* biome-ignore lint/a11y/useHeadingContent: <explanation> */}
            <h2 className="text-xl font-semibold flex sm:hidden"></h2>
            <h2 className="text-xl font-semibold hidden sm:flex">Agent Actions</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CreateActionDialog />
            </div>
          </div>
          {!isLoading && !isError && (
            filteredActions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            ) : (
              <ActionsEmptyState />
            )
          )}
        </div>
      </div>
    </div>
  );
}
