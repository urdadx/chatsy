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
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { AvatarUpload } from "../avatar-upload";
import { ColorPickerDialog } from "../onboarding/pick-color-dialog";
import { Separator } from "../ui/separator";

export function BrandingSettings() {
  const colors = [
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#10b981",
    "#f97316",
    "#ec4899",
  ];

  const [name, setName] = useState("urdadx");
  const [primaryColor, setPrimaryColor] = useState(colors[0]);
  const [theme, setTheme] = useState("Dark");
  const [hidePoweredBy, setHidePoweredBy] = useState(false);

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
          <Input
            id="name"
            className="w-[300px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <Select value={primaryColor} onValueChange={setPrimaryColor}>
              <SelectTrigger id="primary-color" className="w-[260px]">
                <div className="flex items-center gap-2">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {colors?.map((color: string, index: number) => {
                  return (
                    <>
                      <SelectItem key={index} value={color}>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              backgroundColor: `${color}`,
                            }}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="capitalize">Purple</span>
                        </div>
                      </SelectItem>
                    </>
                  );
                })}
              </SelectContent>
            </Select>
            <ColorPickerDialog />
          </div>
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="theme">Theme</Label>
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
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger id="theme" className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Light">Light</SelectItem>
              <SelectItem value="Dark">Dark</SelectItem>
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
          <Switch
            id="hide-powered-by"
            checked={hidePoweredBy}
            onCheckedChange={setHidePoweredBy}
          />
        </div>
      </div>
      <div className="h-[16px]" />
    </div>
  );
}
