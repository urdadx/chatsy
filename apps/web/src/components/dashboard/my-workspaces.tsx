import { Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateWorkspace } from "../workspace/new-workspace";

export const MyWorkspaces = () => {
  const [openWorkspace, setOpenWorkspace] = useState(false);

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
          <div className="bg-white rounded-lg p-4 space-y-3 border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <img
                  src="https://avatars.githubusercontent.com/u/70736338?v=4"
                  alt="RedPear Bot"
                  className="w-10 h-10 rounded-full object-cover border-2"
                />
                <h3 className="text-md font-medium">RedPear Bot</h3>
              </div>
            </div>
            <div className="flex w-full items-center justify-between ">
              <Button className="w-full" variant="outline">
                <Settings2 />
                Customize
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
