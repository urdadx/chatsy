import { containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { AtSign } from "lucide-react";
import { Input } from "../ui/input";

interface SocialPlatform {
  name: string;
  icon: string;
}

const platforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: "https://img.icons8.com/fluency/48/instagram-new.png",
  },
  { name: "TikTok", icon: "https://img.icons8.com/color/48/tiktok--v1.png" },

  { name: "YouTube", icon: "https://img.icons8.com/color/48/youtube-play.png" },
];

export const StepFour = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6 pt-6"
    >
      <div className="flex flex-col">
        <h1 className="text-2xl text-start font-semibold">
          Connect your socials
        </h1>
        <p className="text-start text-muted-foreground">
          Add your favorite social accounts
        </p>
      </div>
      <form className="space-y-4 w-full mt-2">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex flex-row sm:items-center gap-3 py-2"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-muted/30">
              <img
                src={platform.icon}
                alt={`${platform.name} icon`}
                width={30}
                height={30}
                className="object-contain w-8 h-8"
                loading="lazy"
              />
            </div>
            <div className="relative w-full">
              <Input
                id={`input-${platform.name}`}
                className="peer ps-9 w-full"
                placeholder="username"
                type="text"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <AtSign size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </form>
    </motion.div>
  );
};
