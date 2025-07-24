import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const WorkspaceNameSettings = () => {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const organizationId = session?.session?.activeOrganizationId ?? "";

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeOrganization) {
      setName(activeOrganization.name);
    }
  }, [activeOrganization]);

  const handleSave = async () => {
    if (organizationId) {
      await authClient.organization.update({
        data: {
          name: name,
        },
      });
      toast.success("Saved!");
      await queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-xs border overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-base font-semibold mb-2">Workspace Name</h2>
          <p className="text-gray-600 text-sm">Update your workspace's name.</p>
        </div>
        <div className="p-6 pt-3">
          <div className="flex flex-col gap-4">
            <Input
              id="workspace-name"
              type="text"
              className="mt-1 block w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button
            onClick={handleSave}
            disabled={name === activeOrganization?.name}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};
