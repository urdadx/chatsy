import { ActionCard } from "@/components/agents/actions-card";
import Spinner from "@/components/ui/spinner";
import type { ActionType } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

const agentSearchSchema = z.object({
  tab: z.enum(["general", "integrations"]).optional().default("general"),
});

export const Route = createFileRoute("/admin/actions")({
  component: RouteComponent,
  validateSearch: agentSearchSchema,
});

function RouteComponent() {
  const [searchTerm, _setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const {
    data: actionsResponse,
    isLoading,
    error,
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
    }: {
      actionId: string;
      isActive: boolean;
    }) => {
      const response = await api.patch("/agent-actions", {
        actionId,
        isActive,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Action ${variables.isActive ? "enabled" : "disabled"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update action status",
      );
    },
  });

  const handleToggleAction = (actionId: string, isActive: boolean) => {
    toggleMutation.mutate({ actionId, isActive });
  };

  const actions: ActionType[] = actionsResponse?.actions || [];

  const filteredActions = actions.filter(
    (action) =>
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0 py-6 min-h-screen">
      {/* Header - fixed position */}
      <div className="w-full mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-xl font-semibold">Agent Actions</h1>
          <span className="text-md text-muted-foreground">
            Enhance your bot's capabilities with powerful AI actions and
            integrations
          </span>
        </div>
      </div>

      {/* Content area - maintains consistent height and position */}
      <div className="w-full min-h-screen">
        {error && (
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-red-600">Failed to load actions</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onToggle={handleToggleAction}
                isLoading={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
