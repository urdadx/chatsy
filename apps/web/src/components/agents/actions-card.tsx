import type { ActionType } from "@/db/schema";
import { Calendar, Headset, MessageCircle, Search, Users } from "lucide-react";
import { Switch } from "../ui/switch";
import { ActionIcon } from "./action-icon";

interface IntegrationCardProps {
  action: ActionType;
  onToggle: (actionId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

const getIconForToolName = (toolName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    knowledge_base: (
      <ActionIcon>
        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
      </ActionIcon>
    ),
    collect_feedback: (
      <ActionIcon>
        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
      </ActionIcon>
    ),
    collect_leads: (
      <ActionIcon>
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
      </ActionIcon>
    ),
    escalate_to_human: (
      <ActionIcon>
        <Headset className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
      </ActionIcon>
    ),
    schedule_appointment: (
      <ActionIcon>
        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
      </ActionIcon>
    ),
  };

  return (
    iconMap[toolName] || (
      <ActionIcon>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full" />
      </ActionIcon>
    )
  );
};

export const ActionCard = ({
  action,
  onToggle,
  isLoading = false,
}: IntegrationCardProps) => {
  const handleToggle = (checked: boolean) => {
    onToggle(action.id, checked);
  };

  return (
    <div className="bg-white rounded-md p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-xs mx-auto h-full">
      <div className="flex flex-col gap-3 sm:gap-4 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIconForToolName(action.toolName)}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={action.isActive}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        <h3 className="font-medium text-sm sm:text-md">{action.name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm flex-grow">
          {action.description}
        </p>
      </div>
    </div>
  );
};
