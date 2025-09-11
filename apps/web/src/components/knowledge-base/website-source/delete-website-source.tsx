import { useRetrainingBanner } from "@/components/retraining-banner";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface DeleteWebsiteSourceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
}

export const DeleteWebsiteSource = ({
  open,
  onOpenChange,
  id,
}: DeleteWebsiteSourceProps) => {
  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

  const { mutate: deleteSource, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/scrape", { data: { id } });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website-sources"] });
      toast.success("Website source deleted");
      setBanner(true, "Retraining required");
      localStorage.setItem("lastTrainedAt", new Date().toISOString());
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to delete website source");
    },
  });

  const handleDelete = () => {
    deleteSource();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            website source and its content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
