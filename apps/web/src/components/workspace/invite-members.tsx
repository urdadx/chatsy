import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "motion/react";
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
          <form className="space-y-5">
            <div className="space-y-4">
              <div className="*:not-first:mt-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  autoFocus
                  id="email"
                  name="email"
                  type="text"
                  placeholder="johndoe@example.com"
                  required
                />
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="member">
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full">
                  Send Invite
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
