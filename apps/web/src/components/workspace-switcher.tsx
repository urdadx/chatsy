import { ChevronsUpDown, PlusIcon, UserRoundPlus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "boring-avatars";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { InviteMembers } from "./workspace/invite-members";
import { CreateWorkspace } from "./workspace/new-workspace";

export function WorkspaceSwitcher() {
  const { data: activeOrganization, isLoading } = useQuery({
    queryKey: ["activeOrganization"],
    queryFn: async () => {
      const result = await authClient.organization.getFullOrganization();

      return result.data;
    },
  });

  const { data: organizations } = authClient.useListOrganizations();
  const currentLogo = useMemo(
    () => activeOrganization?.logo,
    [activeOrganization?.logo],
  );

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      toast.success("Workspace switched successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to switch workspace");
    }
  };

  const [openCreateOrganization, setOpenCreateOrganization] = useState(false);

  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);

  const handleCreateOrganization = () => {
    setOpenCreateOrganization(true);
  };

  const handleInviteMembers = () => {
    setInviteMembersOpen(true);
  };

  if (isLoading) {
    return (
      <SidebarMenu className="">
        <SidebarMenuItem className="bg-sidebar rounded-lg p-1">
          <SidebarMenuButton size="lg" disabled>
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="grid flex-1 text-left leading-tight">
              <span className="text-muted-foreground text-xs font-normal">
                WORKSPACE
              </span>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <CreateWorkspace
        open={openCreateOrganization}
        setOpen={setOpenCreateOrganization}
      />
      <InviteMembers open={inviteMembersOpen} setOpen={setInviteMembersOpen} />
      <SidebarMenu>
        <SidebarMenuItem className="bg-transparent border-2 rounded-lg p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="default"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {currentLogo ? (
                  <div className=" rounded-full w-8 h-8">
                    <img
                      src={currentLogo}
                      alt={activeOrganization?.name}
                      className="h-full w-full rounded-full object-cover "
                    />
                  </div>
                ) : (
                  <Avatar name={activeOrganization?.name} size={200} />
                )}

                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-normal">
                    {activeOrganization?.name || "No workspace selected"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleInviteMembers}>
                  <UserRoundPlus className="text-primary" />
                  <span className="text-primary hover:text-primary">
                    Invite team members
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {organizations && organizations.length > 1 && (
                <>
                  <DropdownMenuLabel className="text-xs">
                    Workspaces
                  </DropdownMenuLabel>
                  <DropdownMenuGroup className="space-y-1">
                    {organizations.map((org: any) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleSwitchOrganization(org.id)}
                        className={
                          org.id === activeOrganization?.id
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }
                      >
                        <Avatar
                          name={org.name}
                          className="h-8 w-8 rounded-full"
                        />

                        <span className="truncate">{org.name}</span>
                        {org.id === activeOrganization?.id && (
                          <RiCheckboxCircleFill className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}

              <DropdownMenuGroup className="mt-2">
                <DropdownMenuItem onClick={handleCreateOrganization}>
                  <PlusIcon />
                  Create new workspace
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
