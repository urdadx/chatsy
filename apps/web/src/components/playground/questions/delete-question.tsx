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

interface DeleteQuestionProps {
  open: boolean;
  id: string;
  onOpenChange: (open: boolean) => void;
}

export function DeleteQuestion({
  open,
  id,
  onOpenChange,
}: DeleteQuestionProps) {
  const queryClient = useQueryClient();

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      await api.delete("/questions", { data: { id } });
    },
    onSuccess: () => {
      toast.success("Question deleted");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: () => {
      toast.error("Failed to delete question");
    },
  });

  const handleDelete = () => {
    deleteQuestion.mutate(id);
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-md">
              This question will be permanently deleted
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={deleteQuestion.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={handleDelete}
            disabled={deleteQuestion.isPending}
          >
            {deleteQuestion.isPending ? (
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
