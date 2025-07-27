"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import { sleep } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const WorkspaceDelete = () => {
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();
  const organizationId = session?.session?.activeOrganizationId ?? "";
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteWorkspace = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        throw new Error("No workspace selected");
      }
      await authClient.organization.delete({
        organizationId: organizationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });
      toast.success("Workspace deleted successfully");
      setOpen(false);
      window.location.reload();
    },
    onError: (error) => {
      console.error("Failed to delete workspace:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete workspace. Please try again.",
      );
    },
  });

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/login",
          });
        },
        onError: () => {
          toast.error("Failed to log out. Please try again.");
        },
      },
    });
  };

  const handleDelete = async () => {
    deleteWorkspace.mutate();
    await sleep(1);
    handleLogout();
  };

  const workspaceName = activeOrganization?.name || "workspace";

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-red-300 overflow-hidden">
        <div className="p-6">
          <h2 className="text-base font-semibold mb-2">Delete workspace</h2>
          <p className="text-gray-600 text-sm">
            Permanently remove your workspace "{workspaceName}" and all of its
            contents. This action is not reversible, so please continue with
            caution.
          </p>
        </div>
        <div className="bg-red-50 px-6 py-4 flex justify-end border-t border-red-300">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={!organizationId}
              >
                Delete workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <CircleAlert className="opacity-80" size={16} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-md">
                    This will permanently delete the "{workspaceName}"
                    workspace.
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setOpen(false)}
                  disabled={deleteWorkspace.isPending}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-400"
                  onClick={handleDelete}
                  disabled={deleteWorkspace.isPending}
                >
                  {deleteWorkspace.isPending ? (
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
        </div>
      </div>
    </div>
  );
};
