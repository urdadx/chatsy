import { Billing } from "@/components/settings/billing-page";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationsTable } from "@/components/workspace/invitations-table";
import { InviteMembers } from "@/components/workspace/invite-members";
import { MembersTable } from "@/components/workspace/members-table";
import { WorkspaceDelete } from "@/components/workspace/workspace-delete";
import { WorkspaceLogoSettings } from "@/components/workspace/workspace-logo-settings";
import { WorkspaceNameSettings } from "@/components/workspace/workspace-name-settings";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const settingsSchema = z.object({
  tab: z
    .enum(["account", "billing", "members", "invitations"])
    .optional()
    .default("account"),
});

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
  validateSearch: settingsSchema,
});

function RouteComponent() {
  const [isInviteMembersOpen, setInviteMembersOpen] = useState(false);
  const navigate = useNavigate({ from: "/admin/settings" });
  const { tab } = useSearch({ from: "/admin/settings" });

  const handleTabChange = (value: string) => {
    navigate({
      search: {
        tab: value as "account" | "billing" | "members" | "invitations",
      },
    });
  };

  return (
    <>
      <InviteMembers
        open={isInviteMembersOpen}
        setOpen={setInviteMembersOpen}
      />
      <div className="max-w-3xl w-full max-h-screen mx-auto px-4 sm:px-0 py-4">
        <h1 className="text-xl font-semibold my-2 hidden sm:flex">Settings</h1>
        <Tabs
          value={tab}
          onValueChange={handleTabChange}
          className="w-full mt-3"
        >
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
              <TabsTrigger
                value="account"
                className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Account
              </TabsTrigger>

              <TabsTrigger
                value="billing"
                className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Usage & Billing
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Members
              </TabsTrigger>
              <TabsTrigger
                value="invitations"
                className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Invitations
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="account">
            <div className="space-y-6 mt-5">
              <WorkspaceNameSettings />
              <WorkspaceLogoSettings />
              <WorkspaceDelete />
            </div>
            <div className="h-14" />
          </TabsContent>

          <TabsContent value="billing">
            <Billing />
          </TabsContent>
          <TabsContent value="members">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-md font-semibold ">All Members</h1>

              <Button onClick={() => setInviteMembersOpen(true)}>
                Invite new member
              </Button>
            </div>
            <div className="w-full border rounded-lg p-4">
              <MembersTable />
            </div>
          </TabsContent>
          <TabsContent value="invitations">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-md font-semibold ">All Invitations</h1>

              <Button onClick={() => setInviteMembersOpen(true)}>
                Invite new member
              </Button>
            </div>
            <div className="w-full border rounded-lg p-4">
              <InvitationsTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
