import { SolarSettingsBoldDuotone } from "@/assets/icons/settings-duotone";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { DeleteActionDialog } from "./delete-action-dialog";

interface ActionSettingsProps {
  isActive?: boolean;
  showInQuickMenu?: boolean;
  isLoading?: boolean;
  description?: string;
  handleToggleActive?: (isActive: boolean) => void;
  handleToggleQuickMenu?: (showInQuickMenu: boolean) => void;
  handleDescriptionChange?: (description: string) => void;
  handleDelete?: () => void;
}

export const ActionSettings = (props: ActionSettingsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger>
        <div className="w-10 h-10 hover:bg-accent rounded-md flex items-center justify-center text-white hover:cursor-pointer transition-colors duration-200"  >
          <SolarSettingsBoldDuotone className="w-6 h-6 " />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader className="mb-0">
          <DialogTitle className="text-lg">
            Action Settings
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable in bot's conversations</span>
              <Switch
                checked={props.isActive}
                onCheckedChange={props.handleToggleActive}
                aria-label={props.isActive ? "Disable action" : "Enable action"}
                disabled={props.isLoading}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your bot will be able to use this action in its conversations.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show in quick actions</span>
              <Switch
                checked={props.showInQuickMenu}
                onCheckedChange={props.handleToggleQuickMenu}
                aria-label={props.showInQuickMenu ? "Hide from quick actions" : "Show in quick actions"}
                disabled={props.isLoading}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This action will be available in the quick actions menu.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea
              value={props.description || ""}
              onChange={(e) => props.handleDescriptionChange?.(e.target.value)}
              placeholder="Describe what this action does and when it should be used..."
              aria-label="Action description"
              disabled={props.isLoading}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex items-center justify-between">

            <DeleteActionDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onDelete={props.handleDelete || (() => { })}
              isLoading={props.isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}