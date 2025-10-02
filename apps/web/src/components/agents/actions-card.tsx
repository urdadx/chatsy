import { SolarChatRoundUnreadBoldDuotone } from "@/assets/icons/chat-doutone";
import { SolarHeadphonesRoundBoldDuotone } from "@/assets/icons/support-duotone";
import { SolarUsersGroupRoundedBoldDuotone } from "@/assets/icons/users-duotone";
import type { ActionType } from "@/db/schema";
import { Switch } from "../ui/switch";
import { ActionIcon } from "./action-icon";

interface IntegrationCardProps {
  action: ActionType;
  onToggle: (actionId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

const getIconForToolName = (toolName: string) => {
  const iconMap: Record<string, React.ReactNode> = {

    collect_feedback: (
      <ActionIcon>
        <SolarChatRoundUnreadBoldDuotone className="w-6 h-6 sm:w-8 sm:h-8" color="#22c55e" />
      </ActionIcon>
    ),
    collect_leads: (
      <ActionIcon>
        <SolarUsersGroupRoundedBoldDuotone color="#2563eb" className="w-6 h-6 sm:w-8 sm:h-8 " />
      </ActionIcon>
    ),
    escalate_to_human: (
      <ActionIcon>
        <SolarHeadphonesRoundBoldDuotone className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
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
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-xs mx-auto h-full">
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
