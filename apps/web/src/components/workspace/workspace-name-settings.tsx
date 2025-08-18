import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
        organizationId: organizationId,
        data: {
          name: name,
        },
      });
      toast.success("Saved!");
      await queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });
    }
  };

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={name === activeOrganization?.name || !isAdmin}
                >
                  Save changes
                </Button>
              </motion.div>
            </TooltipTrigger>
            {!isAdmin && (
              <TooltipContent className="bg-white shadow-sm p-3" sideOffset={8}>
                <p className="text-black text-sm">
                  Only admins can edit workspace name. Please contact your admin
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
