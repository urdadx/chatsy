import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBranding, useUpdateBranding } from "@/hooks/use-bot-branding";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AvatarUpload } from "../avatar-upload";
import { PickColor } from "../onboarding/pick-color";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

export function BrandingSettings() {
  const { data: branding, error, refetch } = useBranding();
  const updateBrandingMutation = useUpdateBranding();

  const [name, setName] = useState(branding?.name || "");
  const [systemTheme, setSystemTheme] = useState(branding?.theme || "light");
  const [hidePoweredBy, setHidePoweredBy] = useState(
    branding?.hidePoweredBy || false,
  );

  const updateBranding = async (updates: Partial<typeof branding>) => {
    if (!branding) return;

    try {
      const updatedBranding = {
        ...branding,
        ...updates,
      };
      await updateBrandingMutation.mutateAsync(updatedBranding);
    } catch (error) {
      toast.error("Failed to update");
      console.error("Error updating branding:", error);
    }
  };

  const handleNameBlur = () => {
    if (!branding || name === branding.name) return;
    updateBranding({ name });
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setSystemTheme(newTheme);
    updateBranding({ theme: newTheme });
  };

  const handleHidePoweredByChange = (checked: boolean) => {
    setHidePoweredBy(checked);
    updateBranding({ hidePoweredBy: checked });
  };

  if (error) {
    return (
      <div className="w-full mx-auto px-2 sm:px-0">
        <div className="text-center py-8">
          <p className="text-red-500">Error loading branding settings</p>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-0">
      <div className="space-y-8 mt-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="logo">Chat Logo</Label>
          <div className="h-10">
            <AvatarUpload />
          </div>
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <Input
              id="name"
              className="w-[300px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              disabled={updateBrandingMutation.isPending}
            />
            {updateBrandingMutation.isPending && name !== branding?.name && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              </div>
            )}
          </div>
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <PickColor />
          </div>
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="systemTheme">Theme</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose the theme for your bot</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={systemTheme}
            onValueChange={handleThemeChange}
            disabled={updateBrandingMutation.isPending}
          >
            <SelectTrigger id="systemTheme" className="w-[300px]">
              <SelectValue />
              {updateBrandingMutation.isPending &&
                systemTheme !== branding?.theme && (
                  <div className="ml-2">
                    <Spinner className="text-primary" />
                  </div>
                )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="hide-powered-by">Hide "Powered by" text</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove the "Powered by" text from your site</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="hide-powered-by"
              checked={hidePoweredBy}
              onCheckedChange={handleHidePoweredByChange}
              disabled={updateBrandingMutation.isPending}
            />
            {updateBrandingMutation.isPending &&
              hidePoweredBy !== branding?.hidePoweredBy && (
                <Spinner className="text-primary" />
              )}
          </div>
        </div>
      </div>
      <div className="h-[16px]" />
    </div>
  );
}
