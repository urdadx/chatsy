import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CancelInvitationDialog } from "./cancel-invitation-dialog";

export function InvitationActions({ invitation }: { invitation: any }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const queryClient = useQueryClient();
  const { email, role } = invitation;

  const resendInvitation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/invite-member", { email, role });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Invitation resent successfully");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: () => {
      toast.error("Failed to resend invitation");
    },
  });

  const handleResend = () => {
    resendInvitation.mutate(invitation.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/accept-invitation/${invitation.id}`,
    );
    toast.success("Invite link copied to clipboard");
  };

  return (
    <>
      <CancelInvitationDialog
        open={isCancelling}
        invitation={invitation}
        onOpenChange={setIsCancelling}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleResend}>Resend invitation</DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>Copy invite link</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCancelling(true)}>
            Cancel invitation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
