import { useChatbot } from "@/hooks/use-chatbot";
import { cn } from "@/lib/utils";
import {
  RiFacebookFill,
  RiLinkedinBoxFill,
  RiSnapchatFill,
  RiTwitterXFill,
  RiWhatsappFill,
} from "@remixicon/react";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const LinkInBio = ({ embedToken }: { embedToken: string }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const socialLinks = [
    {
      id: "facebook",
      icon: RiFacebookFill,
      iconColor: "text-blue-500",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-200",
      primary: true,
      platform: "facebook" as const,
    },
    {
      id: "whatsapp",
      icon: RiWhatsappFill,
      iconColor: "text-green-500",
      hoverBg: "hover:bg-green-50",
      hoverBorder: "hover:border-green-200",
      primary: true,
      platform: "whatsapp" as const,
    },
    {
      id: "twitter",
      icon: RiTwitterXFill,
      iconColor: "text-[#14171a]",
      hoverBg: "hover:bg-gray-100",
      hoverBorder: "hover:border-gray-300",
      primary: true,
      platform: "twitter" as const,
    },
    {
      id: "snapchat",
      icon: RiSnapchatFill,
      iconColor: "text-yellow-400",
      hoverBg: "hover:bg-yellow-50",
      hoverBorder: "hover:border-yellow-200",
      primary: true,
      platform: "snapchat" as const,
    },
    {
      id: "linkedin",
      icon: RiLinkedinBoxFill,
      iconColor: "text-[#0077b5]",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-200",
      primary: false,
      platform: "linkedin" as const,
    },
  ];

  const socialShareContent = {
    facebook: "https://www.facebook.com",
    whatsapp: "https://api.whatsapp.com",
    snapchat: "https://www.snapchat.com/share",
    twitter: "https://twitter.com/",
    linkedin: "https://www.linkedin.com/",
  };

  const baseUrl = `${window.location.origin}/bio-page/${embedToken}`;

  const handleShare = (platform: keyof typeof socialShareContent) => {
    const text = `Check out my profile on ${platform}!`;
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${baseUrl}`)}`,
      snapchat: `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(baseUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`,
    };

    window.open(urls[platform], "_blank");
  };

  const { data: chatbot } = useChatbot();

  return (
    <>
      <div className="flex justify-center items-center py-2 sm:py-3">
        <div className="relative rounded-full border-2 border-primary">
          <Avatar
            className="inline-flex h-[60px] w-[60px] border-2 
           items-center justify-center overflow-hidden rounded-full align-middle sm:w-[70px] sm:h-[70px] lg:w-[96px] lg:h-[96px]"
          >
            <AvatarImage
              className="h-full w-full rounded-[inherit] object-cover"
              src={chatbot?.image || ""}
              referrerPolicy="no-referrer"
              alt="avatar"
            />
            <AvatarFallback
              className="leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
              delayMs={100}
            >
              {chatbot?.name?.charAt(0).toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {socialLinks.map((social) => (
          <div
            key={social.id}
            className="flex flex-col items-center gap-1 sm:gap-2"
          >
            <Button
              onClick={() => handleShare(social.platform)}
              size="icon"
              variant="outline"
              aria-label={`Share on ${social.id}`}
              className={cn(
                "hover:bg-gray-100 w-10 h-10 sm:w-12 sm:h-12 rounded-3xl",
                social.hoverBg,
                social.hoverBorder,
              )}
            >
              <social.icon
                size={20}
                className={`${social.iconColor} sm:text-[24px]`}
              />
            </Button>
            <span className="text-[10px] sm:text-xs capitalize text-muted-foreground">
              {social.id}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 text-start">
        <div className="space-y-1 sm:space-y-2">
          <div className="relative">
            <Input
              ref={inputRef}
              id="input-53"
              className="pe-9 text-xs sm:text-sm py-1.5 sm:py-2"
              type="text"
              defaultValue={baseUrl}
              aria-label="Share link"
              readOnly
            />
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
                    aria-label={copied ? "Copied" : "Copy to clipboard"}
                    disabled={copied}
                    type="button"
                  >
                    <div
                      className={cn(
                        "transition-all",
                        copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    >
                      <Check
                        className="stroke-emerald-500"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      className={cn(
                        "absolute transition-all",
                        copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                      )}
                    >
                      <Copy size={16} strokeWidth={2} aria-hidden="true" />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  Copy to clipboard
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
};
