import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteMemberDialog } from "./delete-member-dialog";

export function MemberActions({ member }: { member: any }) {
  const [isModifyRoleDialogOpen, setIsModifyRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);
  const queryClient = useQueryClient();

  const handleUpdateRole = async () => {
    try {
      await authClient.organization.updateMemberRole({
        memberId: member.id,
        role: selectedRole,
      });
      toast.success("Member role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      setIsModifyRoleDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update member role");
    }
  };

  return (
    <>
      <Dialog
        open={isModifyRoleDialogOpen}
        onOpenChange={setIsModifyRoleDialogOpen}
      >
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Modify Role</DialogTitle>
            <DialogDescription className="text-md">
              Change the role of {member.user.name} in the organization.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModifyRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteMemberDialog
        open={isDeleteDialogOpen}
        member={member}
        onOpenChange={setIsDeleteDialogOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsModifyRoleDialogOpen(true)}>
            Modify role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
