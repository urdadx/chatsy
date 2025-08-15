import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DeleteChat } from "./delete-chat";

interface ChatLogItemProps {
  id: string;
  type: string;
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
  type,
  onClick,
  isSelected,
}: ChatLogItemProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(true);
  };

  return (
    <>
      <DeleteChat open={open} id={id} onOpenChange={setOpen} />
      <div
        onClick={onClick}
        className={cn(
          "flex cursor-pointer items-start w-full sm:w-[350px] space-x-3 p-4 hover:bg-gray-50 border-b border-gray-100 group",
          isSelected && "bg-gray-50 ",
        )}
      >
        <div className="flex-shrink-0 border-2 rounded-full border-primary">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`}
            alt="Avatar"
            className="w-8 h-8 rounded-full "
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {title}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Created on {description}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {type === "private" && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="capitalize" variant="secondary">
                  Test
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This is a chat you created</TooltipContent>
            </Tooltip>
          )}

          <Button
            size="icon"
            onClick={handleDelete}
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 "
          >
            <Trash2 className="text-red-500" size={16} />
          </Button>
        </div>
      </div>
    </>
  );
};
