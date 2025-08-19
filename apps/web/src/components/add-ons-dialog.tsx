import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bot, MessageCircle, User, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DialogContent } from "./ui/dialog";
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const AddOnsDialog = ({
  defaultValue,
  onOpenChange,
}: {
  defaultValue: string;
  onOpenChange?: (value: boolean) => void;
}) => {
  const { data: session } = useSession();
  const [selectedAddon, setSelectedAddon] = useState<string | null>(
    defaultValue,
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const organizationId = session?.session?.activeOrganizationId;

    if (!session) {
      toast.error("Please sign in first");
      navigate({
        to: "/login",
      });
      return;
    }

    if (!organizationId) {
      toast.error("No active organization found. Please sign in first");
      navigate({
        to: "/login",
      });
      return;
    }

    if (!selectedAddon) {
      toast.error("No addon selected");
      return;
    }

    // Map addon selection to slug
    const addonSlugMap = {
      messages: "extra-message-credits",
      branding: "remove-branding",
      chatbot: "extra-chatbot",
      member: "extra-team-member",
    };

    const slug = addonSlugMap[selectedAddon as keyof typeof addonSlugMap];

    if (!slug) {
      console.error("Invalid addon selection");
      return;
    }

    try {
      await authClient.checkout({
        slug,
        referenceId: organizationId,
      });
    } catch (error) {
      toast.error("An error occured during checkout. Please try again.");
    }

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  const selectAddon = (addonId: string) => {
    setSelectedAddon((prev) => (prev === addonId ? null : addonId));
  };

  const isSelected = (addonId: string) => selectedAddon === addonId;

  const addonsContent = (
    <>
      {/* Extra 5k Messages Addon */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("messages")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("messages")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra 1000 credits</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$12
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra chabot */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("chatbot")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("chatbot")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra AI chatbot</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$7
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("member")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("member")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra team member</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$5
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Remove Padyna Branding Addon  */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("branding")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("branding")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">
                  Remove Padyna branding
                </h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$29
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={!selectedAddon || !isAdmin}
            >
              Proceed to checkout
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </TooltipTrigger>
        {!isAdmin && (
          <TooltipContent className="bg-white shadow-sm p-3" sideOffset={8}>
            <p className="text-black text-sm">
              Only admins can purchase add-ons. Please contact your admin
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </>
  );

  if (isDesktop) {
    return (
      <DialogContent className="w-full max-w-lg">
        <div className="space-y-1">
          <DialogTitle className="text-lg font-semibold">Add-ons</DialogTitle>
          <p className="text-sm text-gray-600">Get more with add-ons</p>
        </div>
        {addonsContent}
      </DialogContent>
    );
  }

  return (
    <DrawerContent>
      <DrawerHeader className="text-left">
        <DrawerTitle className="text-lg font-semibold">Add-ons</DrawerTitle>
        <p className="text-sm text-gray-600">Get more with add-ons</p>
      </DrawerHeader>
      <div className="px-4 space-y-4">{addonsContent}</div>
      <DrawerFooter className="pt-2">
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};
