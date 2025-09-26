import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const StepFour = () => {
  const { nextStep } = useStepperStore();
  const [invitations, setInvitations] = useState([
    { email: "", role: "member" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInvitationChange = (
    index: number,
    field: "email" | "role",
    value: string,
  ) => {
    const newInvitations = [...invitations];
    newInvitations[index][field] = value;
    setInvitations(newInvitations);
  };


  const removeInvitation = (index: number) => {
    const newInvitations = invitations.filter((_, i) => i !== index);
    setInvitations(newInvitations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validInvitations = invitations.filter(
      (inv) => inv.email.trim() !== "",
    );

    if (validInvitations.length === 0) {
      nextStep();
      return;
    }

    setIsLoading(true);

    try {
      const promises = validInvitations.map((invitation) =>
        authClient.organization.inviteMember({
          email: invitation.email.trim(),
          role: invitation.role as "member" | "owner",
        }),
      );

      const results = await Promise.all(promises);

      let hasError = false;
      results.forEach((result, index) => {
        const email = validInvitations[index].email;
        if (result.error) {
          hasError = true;
          toast.error(
            `Failed to send invitation to ${email}: ${result.error.message}`,
          );
        } else {
          toast.success(`Invitation sent to ${email}`);
        }
      });

      if (!hasError) {
        setInvitations([{ email: "", role: "member" }]);
        router.invalidate();
        nextStep();
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Failed to send some invitations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible">
      <form onSubmit={handleSubmit} className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              Invite your team
            </h1>
            <p className="text-start text-muted-foreground">
              Collaborate with your teammates
            </p>
          </div>

          <div className="space-y-4">
            {invitations.map((invitation, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-grow flex rounded-md shadow-xs">
                  <Input
                    id={`email-${index}`}
                    className="-me-px rounded-e-none shadow-none focus-visible:z-10"
                    placeholder="johndoe@example.com"
                    type="email"
                    value={invitation.email}
                    onChange={(e) =>
                      handleInvitationChange(index, "email", e.target.value)
                    }
                    disabled={isLoading}
                  />

                  <Select
                    value={invitation.role}
                    onValueChange={(value) =>
                      handleInvitationChange(index, "role", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-fit border-l-0 rounded-s-none">
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
                {invitations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInvitation(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            {/* <div className="flex justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={addInvitation}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Add email
              </Button>
            </div> */}
          </div>

          <div className="flex gap-2">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => nextStep()}
            disabled={isLoading}
          >
            I'll do this later
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
