import { useChatbot } from "@/hooks/use-chatbot";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Globe, Users } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EmbedOptions } from "./embed-options";
import { LinkInBio } from "./link-in-bio";
import { QRCodeExport } from "./qrcode";

export const ShareBot = () => {
  const [open, setOpen] = useState(false);
  const { data: chatbot } = useChatbot();

  const [isEmbeddingEnabled, setIsEmbeddingEnabled] = useState(false);
  const [embedToken, setEmbedToken] = useState("");

  useEffect(() => {
    if (chatbot) {
      setIsEmbeddingEnabled(chatbot.isEmbeddingEnabled || false);
      setEmbedToken(chatbot.embedToken || "");
    }
  }, [chatbot]);

  const navigate = useNavigate();

  const goToPlayground = () => {
    setOpen(false);
    navigate({
      to: "/admin/playground",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-fit text-primary">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Share your bot</span>
          <span className="inline sm:hidden">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit ">
        <div className=" flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle className="text-left text-base">
              Share your bot
            </DialogTitle>
          </DialogHeader>
        </div>
        {isEmbeddingEnabled ? (
          <Tabs
            defaultValue="widget"
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

            <TabsContent value="widget" className="py-3">
              <EmbedOptions embedToken={embedToken} />
            </TabsContent>

            <TabsContent value="link" className="space-y-6">
              <LinkInBio embedToken={embedToken} />
            </TabsContent>
            <TabsContent value="qr" className="space-y-6">
              <QRCodeExport embedToken={embedToken} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 ">
            <Globe className="w-8 h-8 text-primary" />
            <div className="text-base font-semibold text-muted-foreground">
              Widget not activated
            </div>
            <div className="text-sm text-muted-foreground text-center">
              To share your bot with customers, please activate the widget in
              playground
            </div>
            <Button onClick={goToPlayground} className="mt-2">
              Go to playground
              <ArrowRight className="w-4 h-4" />
            </Button>{" "}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
