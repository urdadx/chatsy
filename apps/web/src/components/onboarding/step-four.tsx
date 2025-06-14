import { useAddSocialLinks } from "@/lib/hooks/use-add-links";
import { containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, AtSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SocialPlatform {
  name: string;
  icon: string;
  baseUrl: string;
}

const platforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: "https://img.icons8.com/fluency/48/instagram-new.png",
    baseUrl: "https://instagram.com/",
  },
  {
    name: "TikTok",
    icon: "https://img.icons8.com/color/48/tiktok--v1.png",
    baseUrl: "https://tiktok.com/@",
  },
  {
    name: "YouTube",
    icon: "https://img.icons8.com/color/48/youtube-play.png",
    baseUrl: "https://youtube.com/@",
  },
];

export const StepFour = () => {
  const [socialInputs, setSocialInputs] = useState<Record<string, string>>({});
  const addSocialLinksMutation = useAddSocialLinks();
  const { nextStep, previousStep } = useStepperStore();

  const handleInputChange = (platform: string, username: string) => {
    setSocialInputs((prev) => ({
      ...prev,
      [platform]: username,
    }));
  };

  const buildUrl = (platform: string, username: string): string => {
    const platformData = platforms.find((p) => p.name === platform);
    if (!platformData || !username.trim()) return "";

    // Remove @ if user included it
    const cleanUsername = username.replace(/^@/, "");
    return `${platformData.baseUrl}${cleanUsername}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const socialLinks = Object.entries(socialInputs)
      .filter(([_, username]) => username.trim())
      .map(([platform, username]) => ({
        platform,
        url: buildUrl(platform, username),
        isConnected: true,
      }));

    if (socialLinks.length === 0) {
      toast.error("Please add at least one social link");
      return;
    }

    await addSocialLinksMutation.mutateAsync(socialLinks);
    nextStep();
  };

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

      <form onSubmit={handleSubmit} className="space-y-4 w-full mt-2">
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
                value={socialInputs[platform.name] || ""}
                onChange={(e) =>
                  handleInputChange(platform.name, e.target.value)
                }
                disabled={addSocialLinksMutation.isPending}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <AtSign size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={previousStep}
            variant="outline"
            type="button"
            disabled={addSocialLinksMutation.isPending}
          >
            Previous
          </Button>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={addSocialLinksMutation.isPending}>
              {addSocialLinksMutation.isPending ? "Adding..." : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
