import { Button } from "@/components/ui/button";
import {
  RiFacebookFill,
  RiInstagramFill,
  RiLinkedinFill,
  RiPinterestFill,
  RiTelegramFill,
  RiTiktokFill,
  RiTwitterFill,
  RiYoutubeFill,
} from "@remixicon/react";
import { SearchQuestions } from "../search-questions";
import { AddSocialLink } from "./add-social-link";

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: RiInstagramFill,
    iconColor: "text-rose-400",
    description: "Connect your bot to Instagram",
  },

  {
    id: "linkedin",
    name: "LinkedIn",
    icon: RiLinkedinFill,
    iconColor: "text-blue-600",
    description: "Connect your bot to LinkedIn",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: RiTwitterFill,
    iconColor: "text-sky-400",
    description: "Connect your bot to Twitter",
  },

  {
    id: "youtube",
    name: "YouTube",
    icon: RiYoutubeFill,
    iconColor: "text-red-500",
    description: "Connect your bot to YouTube",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: RiTiktokFill,
    iconColor: "text-black",
    description: "Connect your bot to TikTok",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: RiFacebookFill,
    iconColor: "text-blue-500",
    description: "Connect your bot to Facebook",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: RiTelegramFill,
    iconColor: "text-sky-500",
    description: "Connect your bot to Telegram",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: RiPinterestFill,
    iconColor: "text-red-600",
    description: "Connect your bot to Pinterest",
  },
];

export const SocialLinks = () => {
  return (
    <>
      <div className="w-full flex flex-col mt-5 gap-5">
        <div className="flex justify-between items-center w-full gap-3">
          <SearchQuestions />
          <AddSocialLink />
        </div>
        <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;

            return (
              <div
                key={platform.id}
                className="flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 space-y-2"
              >
                <div className="flex items-center gap-1 text-sm">
                  <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                  {platform.name}
                </div>
                <span className="text-sm text-muted-foreground">
                  {platform.description}
                </span>
                <Button
                  className="mt-2 w-fit h-9 text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
                  variant="outline"
                >
                  Connect
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
