import { SolarUserRoundedBoldDuotone } from "@/assets/icons/user-icon"
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { SafeBoringAvatar } from "../ui/safe-boring-avatar";
import Spinner from "../ui/spinner";

export const AssignAgentDialog = () => {

  const { data: organization, isLoading, isError, error } = useQuery({
    queryKey: ["organization"],
    queryFn: () => authClient.organization.getFullOrganization(),
  });

  const members = organization?.data?.members;

  const handleAssignAgent = (memberId: string) => {
    console.log("Assigning to agent:", memberId);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="text-primary hover:bg-purple-50 hover:text-purple-500" variant="outline">
            <SolarUserRoundedBoldDuotone color="#915bf5" />
            Assign to agent
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign to agent</DialogTitle>
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {members.map((member: any) => (
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
                      className="ml-3 flex-shrink-0"
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}