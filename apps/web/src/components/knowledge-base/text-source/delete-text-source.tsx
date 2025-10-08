import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlertIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteTextSourceProps {
  open: boolean;
  id: string;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTextSource({
  open,
  id,
  onOpenChange,
}: DeleteTextSourceProps) {
  const queryClient = useQueryClient();

  const deleteTextSource = useMutation({
    mutationFn: async (id: string) => {
      await api.delete("/text-sources", { data: { id } });
    },
    onSuccess: () => {
      toast.success("Text source deleted");
      queryClient.invalidateQueries({
        queryKey: ["text-sources"],
      });
      localStorage.setItem("lastTrainedAt", new Date().toISOString());
    },
    onError: () => {
      toast.error("Failed to delete text source");
    },
  });

  const handleDelete = () => {
    deleteTextSource.mutate(id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-md">
              This text source will be permanently deleted
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={deleteTextSource.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={handleDelete}
            disabled={deleteTextSource.isPending}
          >
            {deleteTextSource.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Yes, delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
