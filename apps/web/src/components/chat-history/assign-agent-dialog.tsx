import { SolarUserRoundedBoldDuotone } from "@/assets/icons/user-icon"
import { useChat } from "@/hooks/use-chat";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { SafeBoringAvatar } from "../ui/safe-boring-avatar";
import Spinner from "../ui/spinner";

interface AssignAgentDialogProps {
  chatId: string;
}

export const AssignAgentDialog = ({ chatId }: AssignAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  const { data: organization, isLoading, isError, error } = useQuery({
    queryKey: ["organization"],
    queryFn: () => authClient.organization.getFullOrganization(),
  });

  const { data: chatData } = useChat(chatId);

  const members = organization?.data?.members;
  const assignedAgentId = chatData?.agentAssigned;

  const handleAssignAgent = async (memberId: string) => {
    setIsAssigning(true);

    try {
      await api.post("/chat/assign-agent", {
        chatId,
        memberId,
      });
      queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });

      toast.success("Assigned successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to assign agent");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="text-primary hover:bg-purple-50 hover:text-purple-500" variant="outline">
            <SolarUserRoundedBoldDuotone color="#915bf5" />
            Assign
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign to team member</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select an member from your organization to assign
            </DialogDescription>
          </DialogHeader>

          <div className="">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-red-500">Failed to load organization members</p>
                <p className="text-xs text-gray-500 mt-1">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            )}

            {!isLoading && !isError && (!members || members.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <SolarUserRoundedBoldDuotone className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No team members found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Invite members to your organization to assign chats
                </p>
              </div>
            )}

            {!isLoading && !isError && members && members.length > 0 && (
              <div className="space-y-2 max-h-[400px] smooth-div">
                {members.map((member: any) => {
                  const isAssigned = member.id === assignedAgentId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <SafeBoringAvatar
                          name={member.user?.name || member.user?.email}
                          size={40}
                          className="flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.user?.name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {member.user?.email}
                          </p>

                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignAgent(member.id)}
                        disabled={isAssigning || isAssigned}
                        className="ml-3 flex-shrink-0"
                        variant={isAssigned ? "secondary" : "default"}
                      >
                        {isAssigning ? (
                          <Spinner className="w-4 h-4" />
                        ) : isAssigned ? (
                          "Assigned"
                        ) : (
                          "Assign"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}