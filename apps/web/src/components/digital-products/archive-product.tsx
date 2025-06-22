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

interface ArchiveProductProps {
  open: boolean;
  id: string;
  featured: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveProduct({
  open,
  id,
  featured,
  onOpenChange,
}: ArchiveProductProps) {
  const queryClient = useQueryClient();

  const archiveProduct = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      await api.patch("/my-products", {
        id,
        featured: !featured,
      });
    },

    onSuccess: (_, { featured }) => {
      toast.success(featured ? "Product unarchived" : "Product archived");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const handleArchive = () => {
    archiveProduct.mutate({ id, featured });
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
              {featured
                ? "Archived products are still accessible, but will not be shown publicly."
                : "Unarchived products will be shown publicly again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={archiveProduct.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={archiveProduct.isPending}
          >
            {archiveProduct.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                updating...
              </div>
            ) : featured ? (
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
