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


interface DeleteChatbotProps {
  chatbotId: string;
  onClose: () => void;
}

export function DeleteChatbot({
  chatbotId,
  onClose,
}: DeleteChatbotProps) {

  const deleteChatbotMutation = useDeleteChatbot();

  const handleDeleteChatbot = async () => {
    try {
      await deleteChatbotMutation.mutateAsync(chatbotId);
      onClose();
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
            className="bg-red-500 hover:bg-red-300 text-white"
            onClick={handleDeleteChatbot}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
