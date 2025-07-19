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
import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlertIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CancelInvitationDialogProps {
  open: boolean;
  invitation: {
    id: string;
    email: string;
  };
  onOpenChange: (open: boolean) => void;
}

export function CancelInvitationDialog({
  open,
  invitation,
  onOpenChange,
}: CancelInvitationDialogProps) {
  const queryClient = useQueryClient();

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await authClient.organization.cancelInvitation({ invitationId });
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
    },
  });

  const handleCancel = () => {
    cancelInvitation.mutate(invitation.id);
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
              {`This will cancel the invitation for ${invitation.email}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={cancelInvitation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={handleCancel}
            disabled={cancelInvitation.isPending}
          >
            {cancelInvitation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelling...
              </div>
            ) : (
              "Yes, cancel"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
