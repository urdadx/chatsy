import CalendlyIcon from "@/assets/calendly.png";
import { SolarAtomBoldDuotone } from "@/assets/icons/atom-icon";
import { SolarBoxMinimalisticBoldDuotone } from "@/assets/icons/box-icon";
import { SolarChatRoundUnreadBoldDuotone } from "@/assets/icons/chat-doutone";
import { SolarClipboardBoldDuotone } from "@/assets/icons/clipboard-icon";
import { SolarHeadphonesRoundBoldDuotone } from "@/assets/icons/support-duotone";
import { SolarUsersGroupRoundedBoldDuotone } from "@/assets/icons/users-duotone";
import type { ActionType } from "@/db/schema";
import { useRouter } from "@tanstack/react-router";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { ActionIcon } from "./action-icon";

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
    custom_form: (
      <ActionIcon>
        <SolarClipboardBoldDuotone color="#00ad69" className="w-6 h-6 sm:w-8 sm:h-8 " />
      </ActionIcon>
    ),
    custom_button: (
      <ActionIcon>
        <SolarBoxMinimalisticBoldDuotone color="#e500b9" className="w-6 h-6 sm:w-8 sm:h-8 " />
      </ActionIcon>
    ),
    calendly_booking: (
      <ActionIcon>
        <img src={CalendlyIcon} alt="Calendly" className="w-6 h-6 sm:w-8 sm:h-8" />
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
  const router = useRouter()

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

  const handleCustomize = () => {
    router.navigate({
      to: '/admin/actions/edit-action',
      search: { actionId: action.id, toolName: action.toolName }
    })
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

  function replaceSpecialChars(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, ' ');
  }

  return (

    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-sm mx-auto h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIconForToolName(action.toolName)}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={props.isActive}
              onCheckedChange={props.handleToggleActive}
              aria-label={props.isActive ? "Disable action" : "Enable action"}
              disabled={props.isLoading}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-md">{action.name}</h3>

        </div>
        <p className="text-gray-600 text-xs lowercase sm:text-sm flex-grow">
          <SolarAtomBoldDuotone className="inline w-4 h-4 mr-1" />
          {replaceSpecialChars(action.toolName || 'new action')}
        </p>
        <div
          className="flex items-center gap-1">
          <Button className="w-full" variant="outline" onClick={handleCustomize}>
            Customize
          </Button>

        </div>

      </div>

    </div >
  );
};
