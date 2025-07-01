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

interface DeleteChatProps {
  open: boolean;
  id: string;
  onOpenChange: (open: boolean) => void;
}

export function DeleteChat({ open, id, onOpenChange }: DeleteChatProps) {
  const queryClient = useQueryClient();

  const deleteChat = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/chat?id=${id}`);
    },
    onSuccess: () => {
      toast.success("Chat deleted");
      queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => {
      toast.error("Failed to delete chat");
    },
  });

  const handleDelete = () => {
    deleteChat.mutate(id);
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
              This chat will be permanently deleted
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={deleteChat.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={handleDelete}
            disabled={deleteChat.isPending}
          >
            {deleteChat.isPending ? (
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
