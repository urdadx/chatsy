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
import { useDeleteChatbot } from "@/hooks/use-chatbot";


interface DeleteWorkspaceProps {
  workspaceId: string;
  onClose: () => void;
}

export function DeleteWorkspace({
  workspaceId,
  onClose,
}: DeleteWorkspaceProps) {

  const deleteChatbotMutation = useDeleteChatbot();

  const handleDeleteChatbot = async () => {
    try {
      await deleteChatbotMutation.mutateAsync(workspaceId);
    } catch (error) {
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            workspace and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white"
            onClick={handleDeleteChatbot}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
