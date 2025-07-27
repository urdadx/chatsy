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
import { toast } from "sonner";

interface DeleteWorkspaceProps {
  workspaceId: string;
  onClose: () => void;
}

export function DeleteWorkspace({
  workspaceId,
  onClose,
}: DeleteWorkspaceProps) {
  const queryClient = useQueryClient();

  const deleteWorkspace = useMutation({
    mutationFn: async () => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }
      await authClient.organization.delete({
        organizationId: workspaceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });
      toast.success("Workspace deleted successfully");
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to delete workspace:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete workspace. Please try again.",
      );
    },
  });

  const handleDelete = async () => {
    deleteWorkspace.mutate();
  };
  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            workspace and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white"
            onClick={handleDelete}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
