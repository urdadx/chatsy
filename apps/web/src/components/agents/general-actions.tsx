import { CardSkeleton } from "@/components/ui/card-skeleton";
import type { ActionType } from "@/db/schema";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ActionCard } from "./actions-card";

export const Actions = () => {
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

  return (
    <>
      <div className="pt-4 flex flex-col justify-between items-center max-w-6xl w-full gap-3">
        {/* <div className="flex justify-center sm:justify-end items-center w-full ">
          <SearchActions value={searchTerm} onChange={setSearchTerm} />
        </div> */}
        {isLoading ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="w-full flex justify-center py-3">
            <p className="text-red-600">Failed to load actions</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-3">
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
    </>
  );
};
