import { SolarChatRoundUnreadBoldDuotone } from "@/assets/icons/chat-doutone";
import { SolarHeadphonesRoundBoldDuotone } from "@/assets/icons/support-duotone";
import { SolarUsersGroupRoundedBoldDuotone } from "@/assets/icons/users-duotone";
import type { ActionType } from "@/db/schema";
import { ActionIcon } from "./action-icon";
import { ActionSettings } from "./action-settings";

interface ActionCardProps {
  action: ActionType;
  onToggle: (actionId: string, field: 'isActive' | 'showInQuickMenu', value: boolean) => void;
  onDescriptionChange?: (actionId: string, description: string) => void;
  onDelete?: (actionId: string) => void;
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
  onDescriptionChange,
  onDelete,
  isLoading = false,
}: ActionCardProps) => {
  const handleToggleActive = (checked: boolean) => {
    onToggle(action.id, 'isActive', checked);
  };

  const handleToggleQuickMenu = (checked: boolean) => {
    onToggle(action.id, 'showInQuickMenu', checked);
  };

  const handleDescriptionChange = (description: string) => {
    onDescriptionChange?.(action.id, description);
  };

  const handleDelete = () => {
    onDelete?.(action.id);
  };

  const props = {
    isActive: action.isActive,
    showInQuickMenu: action.showInQuickMenu,
    description: action.description || undefined,
    isLoading: isLoading,
    handleToggleActive: handleToggleActive,
    handleToggleQuickMenu: handleToggleQuickMenu,
    handleDescriptionChange: handleDescriptionChange,
    handleDelete: handleDelete,
  };

  return (


    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-xs mx-auto h-full">
      <div className="flex flex-col gap-3 sm:gap-4 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIconForToolName(action.toolName)}
          </div>
          <div className="flex items-center gap-2">

            <ActionSettings {...props} />

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
