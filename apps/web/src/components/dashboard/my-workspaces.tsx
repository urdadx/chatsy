import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateWorkspace } from "../workspace/new-workspace";
import { WorkspaceCard } from "../workspace/workspace-card";

export const MyWorkspaces = () => {
  const [openWorkspace, setOpenWorkspace] = useState(false);
  const { data: organizations } = authClient.useListOrganizations();

  const handleCreateWorkspace = () => {
    setOpenWorkspace(true);
  };

  return (
    <>
      <CreateWorkspace open={openWorkspace} setOpen={setOpenWorkspace} />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold ">All workspaces</h2>
          <Button onClick={handleCreateWorkspace}>Create new workspace</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {organizations?.map((workspace, index) => (
            <WorkspaceCard
              key={index}
              workspaceId={workspace.id}
              name={workspace.name}
              logo={workspace?.logo}
              createdAt={workspace.createdAt}
            />
          ))}
        </div>
      </div>
    </>
  );
};
