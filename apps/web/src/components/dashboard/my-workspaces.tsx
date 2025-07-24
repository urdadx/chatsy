import { authClient } from "@/lib/auth-client";
import Avatar from "boring-avatars";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateWorkspace } from "../workspace/new-workspace";

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
          <h2 className="text-md font-bold ">My workspaces</h2>
          <Button onClick={handleCreateWorkspace}>Create new workspace</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {organizations?.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white rounded-lg p-4 space-y-3 border"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {workspace?.logo ? (
                    <div className=" rounded-full w-8 h-8">
                      <img
                        src={workspace.logo}
                        alt={workspace.name}
                        className="h-full w-full rounded-full object-cover "
                      />
                    </div>
                  ) : (
                    <Avatar name={workspace?.name} size={35} />
                  )}
                  <h3 className="text-md font-medium">{workspace.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
