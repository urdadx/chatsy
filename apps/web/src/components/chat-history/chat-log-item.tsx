import { api } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";
import {
  RiAlarmFill,
  RiAlertFill,
  RiCheckboxCircleFill,
  RiDeleteBinFill,
} from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DeleteChat } from "./delete-chat";

interface ChatLogItemProps {
  id: string;
  status: string;
  title: string;
  description: string;
  onClick?: () => void;
  isSelected?: boolean;
  userId?: string | null;
}

export const ChatLogItem = ({
  title,
  description,
  id,
  status,
  onClick,
  isSelected,
}: ChatLogItemProps) => {
  const queryClient = useQueryClient();

  const updateChatStatus = useMutation({
    mutationFn: async ({
      chatId,
      status,
    }: { chatId: string; status: string }) => {
      const response = await api.patch("/update-chat-status", {
        chatId,
        status,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Chat status updated to ${data.chat.status}`);
      // Invalidate all chat-logs queries (with all filter/status combinations)
      queryClient.invalidateQueries({
        queryKey: ["chat-logs"],
        exact: false
      });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error || "Failed to update chat status",
      );
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateChatStatus.mutate({ chatId: id, status: newStatus });
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          "flex cursor-pointer mb-2 rounded-md items-start w-full space-x-3 p-4 hover:bg-gray-50  border-gray-100 group",
          isSelected && "bg-gray-50 rounded-md shadow-xs",
        )}
      >
        <div className="flex-shrink-0 border-2 rounded-full border-primary">
          <img
            src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${id}`}
            alt="Avatar"
            className="w-8 h-8 rounded-full "
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
              {title.length > 30 ? `${title.substring(0, 30)}...` : title}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {timeAgo(description)}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Tooltip>
            <TooltipTrigger>
              <span
                className={cn(
                  "px-2 py-1 rounded-xl text-xs capitalize flex items-center gap-1",
                  status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : status === "unresolved"
                      ? "bg-blue-100 text-blue-800"
                      : status === "escalated"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800",
                )}
              >
                {status}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-white shadow-sm">
              <p className="text-black">
                {status === "resolved"
                  ? "This chat has been resolved"
                  : status === "unresolved"
                    ? "This chat is unresolved"
                    : status === "escalated"
                      ? "This chat has been escalated to a human agent"
                      : "Unknown status"}
              </p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {status !== "unresolved" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("unresolved");
                  }}
                  disabled={updateChatStatus.isPending}
                  className="flex items-center gap-2"
                >
                  <RiAlarmFill className="h-4 w-4 text-blue-600" />
                  Mark as unresolved
                </DropdownMenuItem>
              )}
              {status !== "resolved" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("resolved");
                  }}
                  disabled={updateChatStatus.isPending}
                  className="flex items-center gap-2"
                >
                  <RiCheckboxCircleFill className="h-4 w-4 text-green-600" />
                  Mark as resolved
                </DropdownMenuItem>
              )}
              {status !== "escalated" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("escalated");
                  }}
                  disabled={updateChatStatus.isPending}
                  className="flex items-center gap-2"
                >
                  <RiAlertFill className="h-4 w-4 text-orange-600" />
                  Escalate to human
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={updateChatStatus.isPending}
                className="flex items-center gap-2"
              >
                <RiDeleteBinFill className="h-4 w-4 text-red-600" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <DeleteChat
        id={id}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </>
  );
};
