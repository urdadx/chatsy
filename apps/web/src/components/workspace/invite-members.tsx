import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const InviteMembers = ({ open, setOpen }: any) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.organization.inviteMember({
        email: email.trim(),
        role: role as "member" | "owner",
      });

      if (error) {
        toast.error(error.message || "Failed to send invitation");
        return;
      }

      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ["invitations"] });

      setEmail("");
      setRole("member");

      setOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-md ">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <Users className="size-5 stroke-zinc-800 dark:stroke-zinc-100" />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Invite Teammates
              </DialogTitle>
              <DialogDescription className="sm:text-center underline-offset-4">
                Invite member with different roles to your workspace
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
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={setRole}
                  disabled={isLoading}
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
              <motion.div
                className="w-full"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invite"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
