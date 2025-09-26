import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const FailedStatus = () => {
  const [_lastTrainedAt, setLastTrainedAt] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const trainAgentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/train-agent");
      return response.data;
    },
    onSuccess: () => {
      const now = new Date();
      setLastTrainedAt(now);

      localStorage.setItem("lastTrainedAt", now.toISOString());
      queryClient.invalidateQueries({ queryKey: ["training-status"] });
    },
    onError: (error) => {
      toast.error(`Failed to train agent: ${error.message}`);
    },
  });

  const handleTrainAgent = () => {
    toast.promise(trainAgentMutation.mutateAsync(), {
      loading: "Agent training started...",
      success: () => {
        const now = new Date();
        setLastTrainedAt(now);
        queryClient.invalidateQueries({ queryKey: ["training-status"] });
        return "Agent training completed successfully!";
      },
      error: (error) => `Failed to train agent: ${error.message}`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-800">Training status</p>

      <div className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-bl from-red-50 via-red-25 to-background p-2.5 shadow-xs transition-transform hover:scale-[1.02] dark:shadow-none dark:from-red-950/20 dark:via-red-900/10">
        <div className="flex items-start gap-3 p-1.5">
          <div>
            <p className="text-base flex items-center gap-2 font-medium text-red-700">
              <RiCheckboxCircleFill className="h-6 w-6 text-red-600 mt-0.5" />
              Training failed
            </p>
            <p className="text-sm text-red-600 mt-1 leading-relaxed max-w-2xl">
              There was an error during the training process. Please check the
              provided data and try again. If the issue persists, contact
              support for assistance.
            </p>
            <Button
              variant="outline"
              onClick={handleTrainAgent}
              className="mt-4 border-red-500 text-red-700 hover:text-red-800 hover:border-red-600"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
