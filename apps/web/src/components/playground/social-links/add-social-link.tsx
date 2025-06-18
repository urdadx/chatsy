import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { ConnectSocialCard } from "./connect-social-link-card";

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/",
    description: "Connect your bot to Instagram",
  },

  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/",
    description: "Connect your bot to LinkedIn",
  },
  {
    id: "twitter",
    name: "Twitter",
    url: "https://www.twitter.com/",
    description: "Connect your bot to Twitter",
  },

  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/",
    description: "Connect your bot to YouTube",
  },
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com/",
    description: "Connect your bot to TikTok",
  },
  {
    id: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com/",
    description: "Connect your bot to Facebook",
  },
  {
    id: "telegram",
    name: "Telegram",
    url: "https://www.telegram.org/",
    description: "Connect your bot to Telegram",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    url: "https://www.pinterest.com/",
    description: "Connect your bot to Pinterest",
  },
];

export const AddSocialLink = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add new link{" "}
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-2xl max-h-[82vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg ">Add new link</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="url" className="text-sm font-medium">
                Enter the URL
              </label>
              <Input
                id="url"
                autoFocus
                type="url"
                placeholder="ex: https://www.instagram.com/rico"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-medium pt-4 pb-3 text-gray-600">
            Recommended
          </h3>
          <ScrollArea className="h-[300px] pr-4 ">
            <div className="w-full py-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => {
                return <ConnectSocialCard key={platform.id} props={platform} />;
              })}
            </div>
          </ScrollArea>
          <div className="mt-6 flex justify-end">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="bg-purple-600 text-white">
                Add new link
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
