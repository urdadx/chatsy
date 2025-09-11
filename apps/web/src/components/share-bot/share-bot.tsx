import { useChatbot } from "@/hooks/use-chatbot";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Globe, Users } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EmbedOptions } from "./embed-options";
import { LinkInBio } from "./link-in-bio";
import { QRCodeExport } from "./qrcode";

export const ShareBot = () => {
  const [open, setOpen] = useState(false);
  const { data: chatbot } = useChatbot();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isEmbeddingEnabled, setIsEmbeddingEnabled] = useState(false);
  const [embedToken, setEmbedToken] = useState("");
  const [chatbotName, setChatbotName] = useState("");
  const [activeTab, setActiveTab] = useState("widget");

  useEffect(() => {
    if (chatbot) {
      setIsEmbeddingEnabled(chatbot.isEmbeddingEnabled || false);
      setEmbedToken(chatbot.embedToken || "");
      setChatbotName(chatbot.name || "");
    }
  }, [chatbot]);

  const navigate = useNavigate();

  const goToPlayground = () => {
    setOpen(false);
    navigate({
      to: "/admin/playground",
    });
  };

  const getDialogWidth = () => {
    switch (activeTab) {
      case "widget":
        return "max-w-3xl";
      case "link":
        return "max-w-md";
      case "qr":
        return "max-w-md";
      default:
        return "max-w-lg";
    }
  };

  const triggerButton = (
    <Button variant={"outline"} className="w-fit text-primary">
      <Users className="w-4 h-4" />
      <span className="hidden sm:inline">Share your bot</span>
      <span className="inline sm:hidden">Share</span>
    </Button>
  );

  const shareContent = (
    <>
      {isEmbeddingEnabled ? (
        <Tabs
          defaultValue="widget"
          value={activeTab}
          onValueChange={setActiveTab}
          className="items-center justify-center mx-auto w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-transparent text-foreground">
            <TabsTrigger
              value="widget"
              className="w-full text-xs sm:text-sm px-1 sm:px-3 py-1.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              Embed Code
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="w-full text-xs sm:text-sm px-1 sm:px-3 py-1.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              Link in Bio
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="w-full text-xs sm:text-sm px-1 sm:px-3 py-1.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              Scan QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="widget">
            <EmbedOptions embedToken={embedToken} />
          </TabsContent>

          <TabsContent value="link" className="space-y-6">
            <LinkInBio chatbotName={chatbotName} embedToken={embedToken} />
          </TabsContent>
          <TabsContent value="qr" className="space-y-6">
            <QRCodeExport chatbotName={chatbotName} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          <div className="text-base font-semibold text-muted-foreground">
            Chatbot is not activated
          </div>
          <div className="text-sm text-muted-foreground text-center">
            To share your bot with customers, please activate the chatbot in
            playground
          </div>
          <Button onClick={goToPlayground} className="mt-2">
            Go to playground
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className={`w-full ${getDialogWidth()}`}>
          <DialogHeader>
            <DialogTitle className="text-left text-base">
              Share your bot
            </DialogTitle>
          </DialogHeader>
          {shareContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="h-[65%]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-base">Share your bot</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{shareContent}</div>
        {!isEmbeddingEnabled && (
          <div className="px-4 pb-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
