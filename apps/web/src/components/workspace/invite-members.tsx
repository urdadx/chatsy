import { SolarUsersGroupRoundedBoldDuotone } from "@/assets/icons/users-duotone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { AddOnsDialog } from "../add-ons-dialog";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Spinner from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const InviteMembers = ({ open, setOpen }: any) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [showAddOnsDialog, setShowAddOnsDialog] = useState(false);

  const queryClient = useQueryClient();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await api.post("/invite-member", { email, role });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setEmail("");
      setRole("member");
      setOpen(false);
    },
    onError: (error: any) => {
      console.error("Error sending invitation:", error);
      if (error.status === 402) {
        setShowAddOnsDialog(true);
      }
      const errorMessage =
        error.message || "Failed to send invitation. Please try again.";
      toast.warning(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    inviteMemberMutation.mutate({
      email: email.trim(),
      role,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-lg ">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <SolarUsersGroupRoundedBoldDuotone className="size-5 stroke-zinc-800 dark:stroke-zinc-100" />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center text-xl">
                Invite your team
              </DialogTitle>
              <DialogDescription className="sm:text-center text-base underline-offset-4">
                Invite members with different roles to your organization.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="*:not-first:mt-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  autoFocus
                  id="email"
                  name="email"
                  type="email"
                  placeholder="johndoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={inviteMemberMutation.isPending}
                  required
                />
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={setRole}
                  disabled={inviteMemberMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <motion.div
                  className="w-full"
                  whileHover={{
                    scale: inviteMemberMutation.isPending ? 1 : 1.02,
                  }}
                  whileTap={{
                    scale: inviteMemberMutation.isPending ? 1 : 0.98,
                  }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={inviteMemberMutation.isPending}
                  >
                    {inviteMemberMutation.isPending ? (
                      <Spinner className="text-white" />
                    ) : (
                      <>
                        Send Invite
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className="w-full">
                        <Button type="button" className="w-full" disabled>
                          Send Invite
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-white shadow-sm"
                      sideOffset={8}
                    >
                      <span className="text-black">
                        You must be an admin to invite members
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add-ons Dialog for when member limit is reached */}
      {isDesktop ? (
        <Dialog open={showAddOnsDialog} onOpenChange={setShowAddOnsDialog}>
          <AddOnsDialog
            defaultValue="member"
            onOpenChange={setShowAddOnsDialog}
          />
        </Dialog>
      ) : (
        <Drawer open={showAddOnsDialog} onOpenChange={setShowAddOnsDialog}>
          <DrawerContent>
            <AddOnsDialog
              defaultValue="member"
              onOpenChange={setShowAddOnsDialog}
            />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
