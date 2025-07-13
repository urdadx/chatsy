import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConnectSocialCard } from "./connect-social-link-card";

const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/",
    baseHandle: "https://www.instagram.com/",
    description: "Connect Instagram",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/",
    baseHandle: "https://www.linkedin.com/in/",
    description: "Connect LinkedIn",
  },
  {
    id: "twitter",
    name: "Twitter",
    url: "https://www.twitter.com/",
    baseHandle: "https://www.twitter.com/",
    description: "Connect Twitter",
  },
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/",
    baseHandle: "https://youtube.com/@",
    description: "Connect YouTube",
  },
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com/",
    baseHandle: "https://www.tiktok.com/@",
    description: "Connect TikTok",
  },
  {
    id: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com/",
    baseHandle: "https://www.facebook.com/",
    description: "Connect Facebook",
  },
  {
    id: "telegram",
    name: "Telegram",
    url: "https://www.telegram.org/",
    baseHandle: "https://t.me/",
    description: "Connect Telegram",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    url: "https://www.pinterest.com/",
    baseHandle: "https://www.pinterest.com/",
    description: "Connect Pinterest",
  },
];

const getHostnameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "";
  }
};

export const AddSocialLink = () => {
  const queryClient = useQueryClient();
  const [isFetchingDescription, setIsFetchingDescription] = useState(false);
  const [open, setOpen] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const watchUrl = watch("url");

  const fetchDescriptionMutation = useMutation({
    mutationFn: async (url: string) => {
      setIsFetchingDescription(true);
      const res = await api.get("/get-og-info", { params: { url } });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.description) {
        setValue("description", data.description);
      }
      setIsFetchingDescription(false);
    },
    onError: () => {
      setIsFetchingDescription(false);
    },
  });

  const handleFetchDescription = () => {
    if (watchUrl?.startsWith("http")) {
      const hostname = getHostnameFromUrl(watchUrl);
      if (hostname) {
        setValue("platform", hostname);
      }

      fetchDescriptionMutation.mutate(watchUrl);
    }
  };

  const handlePlatformClick = (platform: (typeof socialPlatforms)[0]) => {
    setValue("url", platform.baseHandle);
    setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
        urlInputRef.current.setSelectionRange(
          platform.baseHandle.length,
          platform.baseHandle.length,
        );
      }
    }, 0);
  };

  const submitLink = useMutation({
    mutationFn: async (data: any) => {
      return await api.post("/my-links", {
        platform: data.platform,
        url: data.url,
        description: data.description,
      });
    },
    onSuccess: () => {
      toast.success("Link added successfully");
      queryClient.invalidateQueries({ queryKey: ["links"] });
      reset();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to add link");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full sm:w-auto">
            <span className="">Add new link</span>
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg p-6 max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-md ">Add new link</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <form
            onSubmit={handleSubmit((data) => submitLink.mutate(data))}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
              <div className="flex flex-col px-2">
                <label htmlFor="url" className="text-sm font-medium mb-2">
                  Enter the URL
                </label>
                <div className="relative ">
                  <Input
                    id="url"
                    autoFocus
                    type="url"
                    placeholder="ex: https://www.instagram.com/rico"
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    {...register("url")}
                    onBlur={handleFetchDescription}
                  />
                  {isFetchingDescription && (
                    <div className="absolute right-3 top-2.5 h-5 w-5 border-2 border-purple-500 border-t-transparent animate-spin rounded-full" />
                  )}
                </div>
              </div>

              {/* Hidden inputs for platform and description */}
              <input type="hidden" {...register("platform")} />
              <input type="hidden" {...register("description")} />

              <div className="space-y-3 px-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Recommended
                </h3>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 sm:gap-3 pb-2">
                    {socialPlatforms.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => handlePlatformClick(platform)}
                        className="flex-shrink-0 cursor-pointer"
                      >
                        <ConnectSocialCard props={platform} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>

            <div className="flex justify-end pt-4 sm:pt-6 mt-auto flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  type="submit"
                  className="bg-purple-600 text-white px-4 sm:px-6 py-2 w-full sm:w-auto text-sm "
                  disabled={submitLink.isPending}
                >
                  <CirclePlus className="mr-1 h-4 w-4" />
                  {submitLink.isPending ? (
                    <>
                      <span className="hidden sm:inline">Adding link...</span>
                      <span className="sm:hidden">Adding...</span>
                      <Spinner />
                    </>
                  ) : (
                    <>
                      <span className="sm:inline">Add link</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
