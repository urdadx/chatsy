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

interface ArchiveLinkProps {
  open: boolean;
  id: string;
  isConnected: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveLink({
  open,
  id,
  isConnected,
  onOpenChange,
}: ArchiveLinkProps) {
  const queryClient = useQueryClient();

  const archiveLink = useMutation({
    mutationFn: async ({
      id,
      isConnected,
    }: { id: string; isConnected: boolean }) => {
      await api.patch("/my-links", {
        id,
        isConnected: !isConnected,
      });
    },

    onSuccess: (_, { isConnected }) => {
      toast.success(isConnected ? "Link unarchived" : "Link archived");
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: () => {
      toast.error("Failed to update link");
    },
  });

  const handleArchive = () => {
    archiveLink.mutate({ id, isConnected });
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
              {isConnected
                ? "Archived links are still accessible, but will not be shown publicly."
                : "Unarchived links will be shown publicly again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={archiveLink.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={archiveLink.isPending}
          >
            {archiveLink.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                updating...
              </div>
            ) : isConnected ? (
              "Yes, archive"
            ) : (
              "Yes, unarchive"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
