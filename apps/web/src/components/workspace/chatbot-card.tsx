import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { timeAgo } from "@/lib/utils";
import { ArrowRightLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteWorkspace } from "./delete-workspace";

interface ChatbotCardProps {
  workspaceId: string;
  name: string;
  logo: string | null | undefined;
  createdAt: Date;
}

const GRADIENT_PRESETS = [
  "bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500",
  "bg-gradient-to-br from-pink-500 via-red-500 to-orange-500",
  "bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500",
  "bg-gradient-to-br from-green-500 via-teal-500 to-blue-500",
  "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500",
  "bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500",
  "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500",
  "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500",
  "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500",
  "bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500",
  "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500",
];

export function ChatbotCard({
  workspaceId,
  name,
  logo,
  createdAt,
}: ChatbotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const gradientClass = useMemo(() => {
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % GRADIENT_PRESETS.length;
    return GRADIENT_PRESETS[index];
  }, [name]);

  const handleSwitchBot = async () => {
    try {
      await authClient.organization.setActive({
        organizationId: workspaceId,
      });
      toast.success("Workspace switched successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to switch workspace");
    }
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto">
        <div className="overflow-hidden border rounded-lg">
          <div className="relative h-24 overflow-hidden">
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`relative h-24 ${gradientClass} p-6`} />
            )}
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-md">{name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Created {timeAgo(createdAt)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleSwitchBot}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Switch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setIsDeleting(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      {isDeleting && (
        <DeleteWorkspace
          workspaceId={workspaceId}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
